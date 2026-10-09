/**
 * Offline-aware API helper.
 *
 * For each write endpoint, this wraps the live API call so that:
 *  - If online, attempt the live call.
 *  - On success, return the parsed data.
 *  - On a 4xx business error (409 conflict, 422 validation), propagate the
 *    error immediately — these are real user-facing problems that should
 *    NOT be silently queued.
 *  - On network failure (no internet, DNS, timeout), enqueue the operation
 *    in the outbox so it can sync when connectivity returns. Return a
 *    "pending" envelope so the UI can show "Đã lưu trên thiết bị".
 *
 * Reads are NOT routed through here — they hit `*` exports in
 * `src/api/index.ts` directly and should fall back to cached data when
 * they fail (handled in each screen).
 */

import {
  apiClient,
  extractApiError,
  isNetworkError as apiIsNetworkError,
} from '@/src/auth/api/client';
import { enqueue } from '@/src/offline/outbox';

export type OfflineResult<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'queued'; outboxId: string; localState?: Record<string, unknown> }
  | { kind: 'error'; message: string; code?: string | null };

interface OfflineOptions<T> {
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload?: Record<string, unknown>;
  entityType: string;
  entityId?: string;
  localState?: Record<string, unknown>;
}

export async function offlineWrite<T>(opts: OfflineOptions<T>): Promise<OfflineResult<T>> {
  try {
    const res = await apiClient.request<T>({
      method: opts.method.toLowerCase() as 'post' | 'patch' | 'delete',
      url: opts.endpoint,
      data: opts.payload,
    });
    return { kind: 'ok', data: res.data };
  } catch (err: unknown) {
    if (apiIsNetworkError(err)) {
      const item = await enqueue({
        endpoint: opts.endpoint,
        method: opts.method,
        payload: opts.payload ?? {},
        entityType: opts.entityType,
        entityId: opts.entityId,
        localState: opts.localState,
      });
      return { kind: 'queued', outboxId: item.id, localState: opts.localState };
    }
    // Business error — surface immediately.
    const message = extractApiError(err);
    return { kind: 'error', message, code: null };
  }
}
