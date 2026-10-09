/**
 * SyncStatusPill — centralized, semantic sync indicator.
 *
 * Single source of truth for SYNCED / PENDING / SYNCING / FAILED / CONFLICT /
 * OFFLINE. Uses the maritime palette tokens (no hardcoded colors).
 *
 * Usage:
 *   <SyncStatusPill />
 *   <SyncStatusPill compact />
 *   <SyncStatusPill onPress={...} />
 */

import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { cn } from '@/lib/cn';
import { useSyncStore } from '@/src/offline/sync-store';

type SyncVariant = 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict' | 'offline';

interface VariantConfig {
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
  label: (count: number) => string;
}

function getVariant(
  online: boolean,
  pending: number,
  syncing: boolean,
  conflict: number,
  error: number
): SyncVariant {
  if (!online) return 'offline';
  if (conflict > 0) return 'conflict';
  if (error > 0) return 'failed';
  if (syncing) return 'syncing';
  if (pending > 0) return 'pending';
  return 'synced';
}

const VARIANTS: Record<SyncVariant, VariantConfig> = {
  synced: {
    bgClass: 'bg-syncSyncedSurface',
    textClass: 'text-syncSynced',
    borderClass: 'border-syncSynced/20',
    icon: 'check-circle',
    label: () => 'Đã đồng bộ',
  },
  pending: {
    bgClass: 'bg-syncPendingSurface',
    textClass: 'text-syncPending',
    borderClass: 'border-syncPending/20',
    icon: 'clock-outline',
    label: (c) => `${c} chờ đồng bộ`,
  },
  syncing: {
    bgClass: 'bg-syncSyncingSurface',
    textClass: 'text-syncSyncing',
    borderClass: 'border-syncSyncing/20',
    icon: 'sync',
    label: (c) => (c > 0 ? `Đang đồng bộ · ${c}` : 'Đang đồng bộ…'),
  },
  failed: {
    bgClass: 'bg-syncErrorSurface',
    textClass: 'text-syncError',
    borderClass: 'border-syncError/20',
    icon: 'alert-circle',
    label: (c) => `${c} lỗi · nhấn để xử lý`,
  },
  conflict: {
    bgClass: 'bg-syncConflictSurface',
    textClass: 'text-syncConflict',
    borderClass: 'border-syncConflict/20',
    icon: 'alert-octagon',
    label: (c) => `${c} xung đột · nhấn để xử lý`,
  },
  offline: {
    bgClass: 'bg-syncOfflineSurface',
    textClass: 'text-syncOffline',
    borderClass: 'border-syncOffline/20',
    icon: 'cloud-off-outline',
    label: (c) => (c > 0 ? `Offline · ${c} chờ` : 'Offline'),
  },
};

interface SyncStatusPillProps {
  /** Compact rendering for headers (smaller padding/font). */
  compact?: boolean;
  /** Optional press handler — if omitted, pill is non-interactive. */
  onPress?: () => void;
  /** Override className for outer container. */
  className?: string;
}

function SyncStatusPillBase({
  compact = false,
  onPress,
  className,
}: SyncStatusPillProps) {
  const online = useSyncStore((s) => s.online);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const conflictCount = useSyncStore((s) => s.conflictCount);
  const errorCount = useSyncStore((s) => s.errorCount);
  const syncing = useSyncStore((s) => s.syncing);

  const variant = useMemo(
    () =>
      getVariant(
        online,
        pendingCount,
        syncing,
        conflictCount,
        errorCount
      ),
    [online, pendingCount, syncing, conflictCount, errorCount]
  );

  const config = VARIANTS[variant];
  const count =
    variant === 'pending' || variant === 'syncing'
      ? pendingCount
      : variant === 'failed'
        ? errorCount
        : variant === 'conflict'
          ? conflictCount
          : 0;

  const paddingClass = compact ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const iconSize = compact ? 12 : 14;
  const fontClass = compact ? 'text-[11px]' : 'text-xs';

  const inner = (
    <View
      className={cn(
        'flex-row items-center self-start rounded-full border',
        paddingClass,
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={iconSize}
        className={config.textClass}
      />
      <Text className={cn('ml-1 font-medium', fontClass, config.textClass)}>
        {config.label(count)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={config.label(count)}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

export const SyncStatusPill = memo(SyncStatusPillBase);
export default SyncStatusPill;
