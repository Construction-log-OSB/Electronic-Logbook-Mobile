/**
 * Sync Center — manages pending/outbox items, conflicts, and errors.
 *
 * Maritime palette tokens. All status colors derive from the design system.
 */

import * as React from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableFlatList } from '@/components/ui/RefreshableScroll';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { useSyncStore } from '@/src/offline/sync-store';
import { listOutbox, markSynced } from '@/src/offline/outbox';
import { useColors } from '@/src/design-system/use-colors';
import { Radius } from '@/src/design-system/tokens';

type OutboxItem = Awaited<ReturnType<typeof listOutbox>>[number];
type StatusKind = 'SYNCED' | 'PENDING' | 'SYNCING' | 'ERROR' | 'OFFLINE';

function statusKind(item: OutboxItem, online: boolean): StatusKind {
  if (!online) return 'OFFLINE';
  if (item.status === 'ERROR' || item.status === 'CONFLICT') return 'ERROR';
  if (item.status === 'IN_FLIGHT') return 'SYNCING';
  if (item.status === 'PENDING') return 'PENDING';
  return 'SYNCED';
}

export default function SyncCenterScreen() {
  const online = useSyncStore((s) => s.online);
  const syncing = useSyncStore((s) => s.syncing);
  const refreshCounts = useSyncStore((s) => s.refreshCounts);
  const drainNow = useSyncStore((s) => s.drainNow);
  const palette = useColors();

  const [items, setItems] = React.useState<OutboxItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    try {
      const data = await listOutbox();
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    void refreshCounts();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await load();
    await refreshCounts();
  }, [refreshCounts]);

  async function handleManualSync() {
    if (!online) {
      notify.warning('Không có kết nối mạng.');
      return;
    }
    await drainNow();
    await load();
    await refreshCounts();
    notify.success('Đã đồng bộ');
  }

  async function handleDiscard(item: OutboxItem) {
    try {
      await markSynced(item.id);
      notify.info('Đã bỏ thay đổi này.');
      await load();
      await refreshCounts();
    } catch {
      notify.error('Không thể xoá.');
    }
  }

  const pending = items.filter((i) => i.status === 'PENDING');
  const errors = items.filter((i) => i.status === 'ERROR' || i.status === 'CONFLICT');
  const totalPending = pending.length;
  const totalErrors = errors.length;

  const bannerKind: StatusKind = !online
    ? 'OFFLINE'
    : totalErrors > 0
      ? 'ERROR'
      : totalPending > 0
        ? 'PENDING'
        : syncing
          ? 'SYNCING'
          : 'SYNCED';

  const bannerColors = (() => {
    switch (bannerKind) {
      case 'OFFLINE':
        return {
          bg: palette.syncOfflineSurface,
          fg: palette.syncOffline,
          title: 'Offline',
        };
      case 'ERROR':
        return {
          bg: palette.syncErrorSurface,
          fg: palette.syncError,
          title: 'Có lỗi đồng bộ',
        };
      case 'PENDING':
        return {
          bg: palette.syncPendingSurface,
          fg: palette.syncPending,
          title: 'Đang chờ đồng bộ',
        };
      case 'SYNCING':
        return {
          bg: palette.syncSyncingSurface,
          fg: palette.syncSyncing,
          title: 'Đang đồng bộ',
        };
      case 'SYNCED':
      default:
        return {
          bg: palette.syncSyncedSurface,
          fg: palette.syncSynced,
          title: 'Đã đồng bộ',
        };
    }
  })();

  const bannerSubtitle = !online
    ? 'Dữ liệu được lưu trên thiết bị'
    : totalErrors > 0
      ? `${totalErrors} lỗi cần xử lý`
      : totalPending > 0
        ? `${totalPending} thay đổi chờ đồng bộ`
        : 'Mọi thứ đã đồng bộ';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Đồng bộ" />

      {/* Status banner */}
      <View
        className="mx-4 mb-3 flex-row items-center justify-between px-4 py-3"
        style={{
          borderRadius: Radius.lg,
          minHeight: 64,
          backgroundColor: bannerColors.bg,
        }}>
        <View className="flex-1 pr-3">
          <Text className="font-semibold" style={{ color: bannerColors.fg }}>
            {bannerColors.title}
          </Text>
          <Text variant="caption1" style={{ color: bannerColors.fg, opacity: 0.85 }}>
            {bannerSubtitle}
          </Text>
        </View>
        <Button
          variant="tonal"
          size="sm"
          onPress={handleManualSync}
          disabled={!online || syncing}
          accessibilityLabel="Đồng bộ ngay"
          style={{ borderCurve: 'continuous', minHeight: 44 }}>
          {syncing ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={{ color: palette.primary }}>Đồng bộ ngay</Text>
          )}
        </Button>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name="cloud-check-outline"
            size={40}
            color={palette.textMuted}
          />
          <Text
            className="mt-3 text-center"
            style={{ color: palette.textMuted }}>
            Không có thay đổi nào chờ đồng bộ.
          </Text>
        </View>
      ) : (
        <RefreshableFlatList
          data={items}
          keyExtractor={(item) => item.id}
          onRefresh={handleRefresh}
          contentContainerClassName="px-4 pb-6 pt-1"
          renderItem={({ item }) => (
            <OutboxItemRow
              item={item}
              online={online}
              onDiscard={() => handleDiscard(item)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-2" />}
        />
      )}
    </SafeAreaView>
  );
}

function OutboxItemRow({
  item,
  online,
  onDiscard,
}: {
  item: OutboxItem;
  online: boolean;
  onDiscard: () => void;
}) {
  const palette = useColors();
  const kind = statusKind(item, online);
  const meta = (() => {
    switch (kind) {
      case 'ERROR':
        return {
          bg: palette.syncErrorSurface,
          fg: palette.syncError,
          icon: 'alert-circle' as const,
          label: 'Lỗi',
        };
      case 'SYNCING':
        return {
          bg: palette.syncSyncingSurface,
          fg: palette.syncSyncing,
          icon: 'sync' as const,
          label: 'Đang đồng bộ',
        };
      case 'PENDING':
        return {
          bg: palette.syncPendingSurface,
          fg: palette.syncPending,
          icon: 'clock-outline' as const,
          label: 'Chờ đồng bộ',
        };
      case 'OFFLINE':
        return {
          bg: palette.syncOfflineSurface,
          fg: palette.syncOffline,
          icon: 'wifi-off' as const,
          label: 'Offline',
        };
      case 'SYNCED':
      default:
        return {
          bg: palette.syncSyncedSurface,
          fg: palette.syncSynced,
          icon: 'check-circle' as const,
          label: 'Đã đồng bộ',
        };
    }
  })();

  const endpoint = item.endpoint;
  const displayEndpoint =
    endpoint.length > 60 ? `${endpoint.slice(0, 57)}…` : endpoint;

  return (
    <View
      className="rounded-xl border p-3"
      style={{
        backgroundColor: meta.bg,
        borderColor: 'transparent',
        borderCurve: 'continuous',
      }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons name={meta.icon} size={16} color={meta.fg} />
            <Text
              variant="caption2"
              className="font-semibold"
              style={{ color: meta.fg }}>
              {meta.label}
            </Text>
          </View>
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {item.entityType?.replace(/-/g, ' ') ?? 'Thay đổi'}
          </Text>
          <Text variant="caption1" className="mt-0.5 text-muted-foreground">
            {item.method} · {endpoint.split('/').pop()}
          </Text>
          <Text variant="caption2" className="mt-1 text-muted-foreground" numberOfLines={1}>
            {displayEndpoint}
          </Text>
          {item.errorMessage ? (
            <Text variant="caption2" className="mt-1" style={{ color: palette.danger }}>
              {friendlyApiError(item.errorMessage)}
            </Text>
          ) : null}
          <Text variant="caption2" className="mt-1 text-muted-foreground">
            {new Date(item.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>
        {(item.status === 'PENDING' || item.status === 'IN_FLIGHT') ? (
          <Button
            variant="secondary"
            size="sm"
            onPress={onDiscard}
            accessibilityLabel="Bỏ thay đổi này"
            style={{
              borderCurve: 'continuous',
              minHeight: 36,
              borderColor: palette.danger,
              borderWidth: 1,
            }}>
            <Text
              variant="caption2"
              className="font-semibold"
              style={{ color: palette.danger }}>
              Bỏ
            </Text>
          </Button>
        ) : null}
      </View>
    </View>
  );
}