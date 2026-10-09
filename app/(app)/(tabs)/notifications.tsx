/**
 * Notifications Tab — list of notifications.
 *
 * Palette-aware priority colors via useColors() (no raw hex),
 * accessible Pressable targets ≥ 44pt.
 */

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableFlatList } from '@/components/ui/RefreshableScroll';
import { useColors } from '@/src/design-system/use-colors';

import { getNotifications, markNotificationRead, Notification } from '@/src/api';

type IconName =
  | 'alert-circle'
  | 'alert'
  | 'bell'
  | 'bell-outline';

const PRIORITY_ICON: Record<string, IconName> = {
  URGENT: 'alert-circle',
  HIGH: 'alert',
  NORMAL: 'bell',
  LOW: 'bell-outline',
};

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'Khẩn cấp',
  HIGH: 'Quan trọng',
  NORMAL: 'Bình thường',
  LOW: 'Thấp',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchNotifications(pageNum: number = 1) {
    try {
      if (pageNum === 1) {
        setError(null);
      }
      const response = await getNotifications({ page: pageNum, limit: 20 });

      if (pageNum === 1) {
        setNotifications(response.data);
      } else {
        setNotifications((prev) => [...prev, ...response.data]);
      }
    } catch {
      setError('Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications(1);
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await fetchNotifications(1);
  }, []);

  async function handleMarkAsRead(notif: Notification) {
    if (notif.isRead) return;
    try {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silently fail
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState label="Đang tải thông báo..." />
      </SafeAreaView>
    );
  }

  if (error && (!notifications || notifications.length === 0)) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ErrorState
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text variant="title2" className="font-bold">Thông báo</Text>
      </View>

      {(notifications?.length ?? 0) === 0 ? (
        <EmptyState
          icon="bell-off-outline"
          title="Không có thông báo"
          description="Các thông báo quan trọng sẽ xuất hiện tại đây."
        />
      ) : (
        <RefreshableFlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleMarkAsRead(item)}
            />
          )}
          onRefresh={handleRefresh}
          contentContainerClassName="px-6 pb-6 gap-2"
          ItemSeparatorComponent={() => <View className="h-1" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const palette = useColors();
  const icon = PRIORITY_ICON[notification.priority] ?? 'bell';

  const priorityColor = (() => {
    switch (notification.priority) {
      case 'URGENT':
        return palette.danger;
      case 'HIGH':
        return palette.warning;
      case 'NORMAL':
        return palette.info;
      default:
        return palette.textMuted;
    }
  })();

  const priorityBg = (() => {
    switch (notification.priority) {
      case 'URGENT':
        return palette.dangerSurface;
      case 'HIGH':
        return palette.warningSurface;
      case 'NORMAL':
        return palette.infoSurface;
      default:
        return palette.surfaceSecondary;
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}, mức ${PRIORITY_LABEL[notification.priority] ?? notification.priority}${notification.isRead ? ', đã đọc' : ', chưa đọc'}`}
      className="rounded-2xl border p-4"
      style={{
        borderCurve: 'continuous',
        minHeight: 64,
        backgroundColor: notification.isRead ? palette.surfaceSecondary : palette.surface,
        borderColor: notification.isRead ? 'transparent' : palette.border,
      }}>
      <View className="flex-row gap-3">
        <View
          className="items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: priorityBg,
          }}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={priorityColor}
          />
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              variant="subhead"
              className="flex-1 font-semibold">
              {notification.title}
            </Text>
            {!notification.isRead ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: palette.primary,
                }}
              />
            ) : null}
          </View>
          <Text
            variant="footnote"
            className="text-muted-foreground"
            numberOfLines={2}>
            {notification.body}
          </Text>
          <Text variant="caption2" className="text-muted-foreground">
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}