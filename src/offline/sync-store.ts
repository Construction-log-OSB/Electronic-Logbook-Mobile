/**
 * Sync state — Zustand store exposed to the entire app for banners, badges,
 * and the Sync Center screen.
 *
 * Tracks:
 *  - online: derived from NetInfo subscription
 *  - pendingCount / conflictCount / errorCount
 *  - lastSyncedAt
 *  - actions: drainNow, refreshCounts
 */

import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

import {
  pendingCount,
  processOutbox,
  listOutbox,
} from '@/src/offline/outbox';
import { ensureDeviceId } from '@/src/offline/device-id';
import { getSyncStatus, syncRegisterDevice } from '@/src/api';

interface SyncState {
  online: boolean;
  initialized: boolean;
  syncing: boolean;
  pendingCount: number;
  conflictCount: number;
  errorCount: number;
  lastSyncedAt: string | null;
  deviceCount: number;
  init: () => Promise<void>;
  setOnline: (online: boolean) => void;
  refreshCounts: () => Promise<void>;
  drainNow: () => Promise<{ processed: number; conflicts: number; errors: number }>;
}

let unsubscribeNet: (() => void) | null = null;

async function registerDeviceBestEffort(): Promise<void> {
  try {
    const deviceId = await ensureDeviceId();
    await syncRegisterDevice({
      deviceId,
      platform: Platform.OS,
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0',
    });
  } catch {
    // Non-fatal — sync will retry on next online tick.
  }
}

export const useSyncStore = create<SyncState>((set, get) => ({
  online: true,
  initialized: false,
  syncing: false,
  pendingCount: 0,
  conflictCount: 0,
  errorCount: 0,
  lastSyncedAt: null,
  deviceCount: 0,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await ensureDeviceId();

    // Subscribe to network state.
    unsubscribeNet?.();
    unsubscribeNet = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      const wasOnline = get().online;
      set({ online });
      // Auto-drain on offline → online transition.
      if (!wasOnline && online) {
        get().drainNow().catch(() => undefined);
      }
    });

    // Initial count + sync-status fetch.
    await get().refreshCounts();
    // First attempt to drain any leftover pending items from previous session.
    get().drainNow().catch(() => undefined);

    // Best-effort device registration so the server can attribute sync
    // operations to this device. Failures here are non-fatal.
    void registerDeviceBestEffort();
  },

  setOnline: (online) => set({ online }),

  refreshCounts: async () => {
    try {
      const [pending, conflicts, errors] = await Promise.all([
        pendingCount(),
        listOutbox({ status: 'CONFLICT' }).then((xs) => xs.length),
        listOutbox({ status: 'ERROR' }).then((xs) => xs.length),
      ]);
      let lastSyncedAt: string | null = null;
      let deviceCount = 0;
      try {
        const remote = await getSyncStatus();
        lastSyncedAt = remote.lastSyncedAt ?? null;
        deviceCount = remote.deviceCount;
      } catch {
        /* offline — keep cached values */
      }
      set({ pendingCount: pending, conflictCount: conflicts, errorCount: errors, lastSyncedAt, deviceCount });
    } catch {
      /* ignore — counts are non-critical */
    }
  },

  drainNow: async () => {
    if (get().syncing) return { processed: 0, conflicts: 0, errors: 0 };
    set({ syncing: true });
    try {
      const deviceId = await ensureDeviceId();
      const result = await processOutbox(deviceId);
      await get().refreshCounts();
      return result;
    } finally {
      set({ syncing: false });
    }
  },
}));
