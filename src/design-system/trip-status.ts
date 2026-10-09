/**
 * Trip status helpers — centralised colour + label mapping for trip statuses.
 *
 * These used to live in `src/domain/types.ts` (TRIP_STATUS_COLORS) as raw hex
 * literals. They now reference the maritime palette so light/dark themes stay
 * consistent without inverting.
 */

import type { Palette } from './palette';
import { DARK_COLORS, LIGHT_COLORS } from './palette';

export type TripStatus =
  | 'DRAFT'
  | 'PREPARING'
  | 'DEPARTED'
  | 'FISHING'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED';

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: 'Nháp',
  PREPARING: 'Chuẩn bị',
  DEPARTED: 'Đã khởi hành',
  FISHING: 'Đang đánh bắt',
  RETURNING: 'Đang quay về',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const TRIP_STATUS_KEYS: TripStatus[] = [
  'DRAFT',
  'PREPARING',
  'DEPARTED',
  'FISHING',
  'RETURNING',
  'COMPLETED',
  'CANCELLED',
];

export function tripStatusColor(
  status: TripStatus,
  palette: Palette
): string {
  switch (status) {
    case 'DRAFT':
      return palette.tripDraft;
    case 'PREPARING':
      return palette.tripPreparing;
    case 'DEPARTED':
      return palette.tripDeparted;
    case 'FISHING':
      return palette.tripFishing;
    case 'RETURNING':
      return palette.tripReturning;
    case 'COMPLETED':
      return palette.tripCompleted;
    case 'CANCELLED':
      return palette.tripCancelled;
  }
}

export function tripStatusSurface(
  status: TripStatus,
  palette: Palette
): string {
  return tripStatusColor(status, palette) + '22';
}

/** Lifecycle step order (for the visual stepper) */
export const TRIP_LIFECYCLE_ORDER: ReadonlyArray<TripStatus> = [
  'PREPARING',
  'DEPARTED',
  'FISHING',
  'RETURNING',
  'COMPLETED',
];

export function isLifecycleStep(status: TripStatus): boolean {
  return TRIP_LIFECYCLE_ORDER.includes(status);
}

export function lifecycleStepIndex(status: TripStatus): number {
  const i = TRIP_LIFECYCLE_ORDER.indexOf(status);
  return i === -1 ? -1 : i;
}

/** Backwards-compat default export so existing imports of TRIP_STATUS_COLORS still work.
 *  These are LIGHT theme defaults; screens should prefer the hook-based version. */
export const TRIP_STATUS_COLORS_LEGACY: Record<TripStatus, string> = {
  DRAFT: LIGHT_COLORS.tripDraft,
  PREPARING: LIGHT_COLORS.tripPreparing,
  DEPARTED: LIGHT_COLORS.tripDeparted,
  FISHING: LIGHT_COLORS.tripFishing,
  RETURNING: LIGHT_COLORS.tripReturning,
  COMPLETED: LIGHT_COLORS.tripCompleted,
  CANCELLED: LIGHT_COLORS.tripCancelled,
};

export const TRIP_STATUS_COLORS_DARK_LEGACY: Record<TripStatus, string> = {
  DRAFT: DARK_COLORS.tripDraft,
  PREPARING: DARK_COLORS.tripPreparing,
  DEPARTED: DARK_COLORS.tripDeparted,
  FISHING: DARK_COLORS.tripFishing,
  RETURNING: DARK_COLORS.tripReturning,
  COMPLETED: DARK_COLORS.tripCompleted,
  CANCELLED: DARK_COLORS.tripCancelled,
};

export { TRIP_STATUS_KEYS };
