/**
 * Backwards-compat re-export. The new canonical implementations live in
 * `components/ui/StatusBanner.tsx` and `components/ui/SyncStatusPill.tsx`.
 *
 * All screens now import from `@/components/ui` (see components/ui/index.ts).
 * This file is kept so any stale import path continues to resolve without
 * forcing a codebase-wide find/replace before each refactor pass.
 */

export { StatusBanner as default } from '@/components/ui/StatusBanner';
export {
  StatusBanner,
  OfflineBanner,
} from '@/components/ui/StatusBanner';
export { SyncStatusPill } from '@/components/ui/SyncStatusPill';

/** @deprecated kept for one release cycle for any legacy ConflictBanner usages. */
export const ConflictBanner = () => null;
