/**
 * Lightweight toast helper. Uses a global event-bus so any module can
 * notify without prop-drilling. The host is mounted by the root layout.
 */

import { useSyncStore } from '@/src/offline/sync-store';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastEvent {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs?: number;
}

type Listener = (e: ToastEvent) => void;

const listeners = new Set<Listener>();

export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(message: string, variant: ToastVariant, durationMs?: number): void {
  const id = `${Date.now()}-${Math.random()}`;
  for (const l of listeners) l({ id, message, variant, durationMs });
}

export const notify = {
  success: (m: string) => emit(m, 'success'),
  error: (m: string) => emit(m, 'error', 4000),
  warning: (m: string) => emit(m, 'warning'),
  info: (m: string) => emit(m, 'info'),
  queued: (m = 'Đã lưu trên thiết bị. Sẽ đồng bộ khi có mạng.') => {
    emit(m, 'info', 3000);
    // also bump pending count by asking the store to recount
    useSyncStore.getState().refreshCounts().catch(() => undefined);
  },
};
