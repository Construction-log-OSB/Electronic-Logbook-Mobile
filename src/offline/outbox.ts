/**
 * Outbox — offline queue for write operations.
 *
 * Design:
 *  - Every mutation (create fishing operation, add crew, file incident, …)
 *    is either sent directly OR enqueued when offline.
 *  - When offline, a local `localState` is also persisted so the UI can
 *    show pending records immediately.
 *  - The OutboxProcessor drains the queue when the network returns.
 *  - Conflict handling is minimal: when the backend responds 409, the
 *    outbox marks the row as `CONFLICT` and surfaces it to the Sync
 *    Center for the user to resolve manually.
 */

import { v4 as uuid } from 'uuid';
import NetInfo from '@react-native-community/netinfo';

import { db, ensureSchema } from './db';
import { apiClient, isNetworkError } from '@/src/auth/api/client';

export type OutboxStatus = 'PENDING' | 'IN_FLIGHT' | 'SYNCED' | 'CONFLICT' | 'ERROR';

export interface OutboxItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  localState?: Record<string, unknown>;
  status: OutboxStatus;
  errorCode?: string;
  errorMessage?: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  syncedAt?: string;
}

const nowIso = () => new Date().toISOString();

const MAX_ATTEMPTS = 5;

let processorScheduled = false;

export async function enqueue(item: Omit<OutboxItem, 'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'>): Promise<OutboxItem> {
  await ensureSchema();
  const id = uuid();
  const row: OutboxItem = {
    id,
    status: 'PENDING',
    attempts: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...item,
  };
  await db().runAsync(
    `INSERT INTO outbox
       (id, endpoint, method, payload, entityType, entityId, localState,
        status, attempts, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.endpoint,
      row.method,
      JSON.stringify(row.payload),
      row.entityType ?? null,
      row.entityId ?? null,
      row.localState ? JSON.stringify(row.localState) : null,
      row.status,
      row.attempts,
      row.createdAt,
      row.updatedAt,
    ]
  );
  scheduleProcess();
  return row;
}

export async function listOutbox(filter?: { status?: OutboxStatus }): Promise<OutboxItem[]> {
  await ensureSchema();
  const where = filter?.status ? 'WHERE status = ?' : '';
  const params = filter?.status ? [filter.status] : [];
  const rows = await db().getAllAsync<any>(`SELECT * FROM outbox ${where} ORDER BY createdAt ASC`, params);
  return rows.map(rowToItem);
}

export async function pendingCount(): Promise<number> {
  await ensureSchema();
  const r = await db().getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM outbox WHERE status IN ('PENDING','IN_FLIGHT','CONFLICT','ERROR')"
  );
  return r?.c ?? 0;
}

export async function clearSynced(): Promise<number> {
  await ensureSchema();
  const r = await db().runAsync("DELETE FROM outbox WHERE status = 'SYNCED'");
  return r.changes ?? 0;
}

export async function markSynced(id: string): Promise<void> {
  await ensureSchema();
  await db().runAsync(
    "UPDATE outbox SET status='SYNCED', syncedAt=?, updatedAt=? WHERE id=?",
    [nowIso(), nowIso(), id]
  );
}

export async function markInFlight(id: string): Promise<void> {
  await ensureSchema();
  await db().runAsync(
    "UPDATE outbox SET status='IN_FLIGHT', lastAttemptAt=?, updatedAt=? WHERE id=?",
    [nowIso(), nowIso(), id]
  );
}

export async function recordFailure(id: string, code: string | null, message: string): Promise<void> {
  await ensureSchema();
  // 409 = business conflict → mark as CONFLICT for user resolution.
  // Other errors → ERROR, will be retried up to MAX_ATTEMPTS.
  const status: OutboxStatus = code === '409' ? 'CONFLICT' : 'ERROR';
  await db().runAsync(
    `UPDATE outbox
     SET status=?, errorCode=?, errorMessage=?, attempts=attempts+1, lastAttemptAt=?, updatedAt=?
     WHERE id=?`,
    [status, code, message, nowIso(), nowIso(), id]
  );
}

export async function bumpAttempts(id: string): Promise<void> {
  await ensureSchema();
  await db().runAsync(
    "UPDATE outbox SET attempts=attempts+1, lastAttemptAt=?, updatedAt=? WHERE id=?",
    [nowIso(), nowIso(), id]
  );
}

export async function resetForRetry(id: string): Promise<void> {
  await ensureSchema();
  await db().runAsync(
    "UPDATE outbox SET status='PENDING', errorCode=NULL, errorMessage=NULL, updatedAt=? WHERE id=?",
    [nowIso(), id]
  );
}

function rowToItem(r: any): OutboxItem {
  return {
    id: r.id,
    endpoint: r.endpoint,
    method: r.method,
    payload: JSON.parse(r.payload),
    entityType: r.entityType ?? undefined,
    entityId: r.entityId ?? undefined,
    localState: r.localState ? JSON.parse(r.localState) : undefined,
    status: r.status,
    errorCode: r.errorCode ?? undefined,
    errorMessage: r.errorMessage ?? undefined,
    attempts: r.attempts,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    lastAttemptAt: r.lastAttemptAt ?? undefined,
    syncedAt: r.syncedAt ?? undefined,
  };
}

/**
 * Process the outbox. Drains pending items one by one.
 *  - Skips if offline.
 *  - Marks each item IN_FLIGHT, attempts via apiClient.
 *  - On 409 → CONFLICT; on other failure → ERROR (retried up to MAX_ATTEMPTS).
 *  - On success → SYNCED.
 *
 * Returns counts for diagnostic/UI purposes.
 */
export async function processOutbox(deviceId: string): Promise<{
  processed: number;
  conflicts: number;
  errors: number;
}> {
  await ensureSchema();

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return { processed: 0, conflicts: 0, errors: 0 };
  }

  const pending = await listOutbox({ status: 'PENDING' });
  let processed = 0;
  let conflicts = 0;
  let errors = 0;

  for (const item of pending) {
    if (item.attempts >= MAX_ATTEMPTS) {
      // give up on this one — surface as ERROR for manual review
      await recordFailure(item.id, 'MAX_ATTEMPTS', `Đã thử ${MAX_ATTEMPTS} lần không thành công`);
      errors++;
      continue;
    }
    await markInFlight(item.id);
    try {
      // Use the same apiClient path the rest of the app uses (with auth + refresh)
      const config =
        item.method === 'POST'
          ? { method: 'post' as const, url: item.endpoint, data: item.payload }
          : item.method === 'PATCH'
            ? { method: 'patch' as const, url: item.endpoint, data: item.payload }
            : { method: 'delete' as const, url: item.endpoint };
      await apiClient.request(config);
      await markSynced(item.id);
      processed++;
    } catch (err: unknown) {
      const ex = err as { response?: { status?: number }; code?: string; message?: string };
      const status = ex?.response?.status;
      const message =
        (ex as any)?.response?.data?.message ??
        (Array.isArray((ex as any)?.response?.data?.message)
          ? ((ex as any).response.data.message as string[]).join('; ')
          : null) ??
        ex?.message ??
        'Lỗi không xác định';
      if (isNetworkError(err)) {
        // Will be retried on next online tick
        await resetForRetry(item.id);
        continue;
      }
      await recordFailure(item.id, status ? String(status) : null, message);
      if (status === 409) conflicts++;
      else errors++;
    }
  }

  // Sweep — garbage-collect SYNCED rows older than 1 hour to bound storage.
  // (Keeps recent ones for the Sync Center visual.)
  // (skipped — clearSynced is called manually from Sync Center)

  return { processed, conflicts, errors };
}

export function scheduleProcess(): void {
  if (processorScheduled) return;
  processorScheduled = true;
  // debounce micro-bursts (e.g. multiple enqueues in a single form submit)
  setTimeout(() => {
    processorScheduled = false;
    import('@/src/offline/device-id').then((m) =>
      processOutbox(m.getDeviceId()).catch(() => undefined)
    );
  }, 250);
}
