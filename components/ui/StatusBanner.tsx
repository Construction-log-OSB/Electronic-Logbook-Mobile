/**
 * StatusBanner — full-width banner for sync / offline / conflict.
 *
 * Uses semantic sync tokens (no hardcoded colors). Tap → routes to /sync.
 */

import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { cn } from '@/lib/cn';
import { useSyncStore } from '@/src/offline/sync-store';

type BannerVariant = 'offline' | 'syncing' | 'pending' | 'error' | 'clean';

interface VariantConfig {
  bgClass: string;
  textClass: string;
  icon: string;
  label: string;
  sub: string;
}

function getVariant(
  online: boolean,
  pending: number,
  syncing: boolean,
  conflict: number,
  error: number
): BannerVariant {
  if (!online) return 'offline';
  if (conflict > 0 || error > 0) return 'error';
  if (syncing) return 'syncing';
  if (pending > 0) return 'pending';
  return 'clean';
}

function buildConfig(
  variant: BannerVariant,
  pending: number,
  conflict: number,
  error: number
): VariantConfig {
  switch (variant) {
    case 'offline':
      return {
        bgClass: 'bg-syncOfflineSurface',
        textClass: 'text-syncOffline',
        icon: 'cloud-off-outline',
        label: 'Offline',
        sub:
          pending > 0
            ? `${pending} thay đổi sẽ đồng bộ khi có mạng`
            : 'Dữ liệu đang được lưu trên thiết bị',
      };
    case 'syncing':
      return {
        bgClass: 'bg-syncSyncingSurface',
        textClass: 'text-syncSyncing',
        icon: 'sync',
        label: 'Đang đồng bộ…',
        sub:
          pending > 0
            ? `${pending} thay đổi đang chờ`
            : 'Đang gửi dữ liệu lên máy chủ',
      };
    case 'pending':
      return {
        bgClass: 'bg-syncPendingSurface',
        textClass: 'text-syncPending',
        icon: 'clock-outline',
        label: `${pending} thay đổi chờ đồng bộ`,
        sub: 'Sẽ tự động đồng bộ khi có mạng',
      };
    case 'error':
      return {
        bgClass: 'bg-syncErrorSurface',
        textClass: 'text-syncError',
        icon: 'alert-circle',
        label: `${conflict + error} thay đổi cần xử lý`,
        sub: 'Nhấn để xem chi tiết và xử lý thủ công',
      };
    case 'clean':
      return {
        bgClass: 'bg-syncSyncedSurface',
        textClass: 'text-syncSynced',
        icon: 'check-circle',
        label: 'Mọi thứ đã đồng bộ',
        sub: '',
      };
  }
}

function StatusBannerBase() {
  const router = useRouter();
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

  const config = useMemo(
    () =>
      buildConfig(variant, pendingCount, conflictCount, errorCount),
    [variant, pendingCount, conflictCount, errorCount]
  );

  // Don't render the clean banner — it adds noise.
  if (variant === 'clean') return null;

  return (
    <Pressable
      onPress={() => router.push('/sync' as any)}
      accessibilityRole="button"
      accessibilityLabel={`${config.label}. Nhấn để xem chi tiết.`}
    >
      <View className={cn('flex-row items-center px-3 py-2.5', config.bgClass)}>
        <MaterialCommunityIcons
          name={config.icon as any}
          size={18}
          className={config.textClass}
        />
        <View className="ml-2 flex-1">
          <Text className={cn('text-sm font-semibold', config.textClass)}>
            {config.label}
          </Text>
          {config.sub ? (
            <Text className={cn('mt-0.5 text-xs', config.textClass)}>
              {config.sub}
            </Text>
          ) : null}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          className={config.textClass}
        />
      </View>
    </Pressable>
  );
}

export const StatusBanner = memo(StatusBannerBase);

/**
 * OfflineBanner — alias kept for backwards compat (used across many screens).
 * Internally delegates to StatusBanner which already handles offline state.
 */
export const OfflineBanner = memo(StatusBannerBase);
export default StatusBanner;
