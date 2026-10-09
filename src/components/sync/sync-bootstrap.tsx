/**
 * SyncBootstrap — kicks off sync-store initialization once on app mount.
 *
 * Renders nothing — the actual UI lives in OfflineBanner / SyncStatusBadge
 * which subscribe to the store.
 */

import { useEffect } from 'react';

import { useSyncStore } from '@/src/offline/sync-store';

export function SyncBootstrap() {
  const init = useSyncStore((s) => s.init);
  useEffect(() => {
    init().catch(() => undefined);
  }, [init]);
  return null;
}
