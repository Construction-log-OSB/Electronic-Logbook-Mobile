/**
 * Home Tab — Dashboard.
 *
 * Maritime palette, semantic tokens.
 * Uses shared SyncStatusPill, SectionHeader, InlineEmpty, primary CTA.
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SyncStatusPill } from '@/components/ui/SyncStatusPill';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { useColors } from '@/src/design-system/use-colors';
import {
  tripStatusColor,
  tripStatusSurface,
  TRIP_STATUS_LABELS,
} from '@/src/design-system/trip-status';
import { Radius, Spacing } from '@/src/design-system/tokens';

import { useAuthStore } from '@/src/auth/store/auth.store';
import { getDashboard, getNotifications, DashboardData, Notification } from '@/src/api';
import {
  VESSEL_STATUS_LABELS,
  isActiveTrip,
} from '@/src/domain/types';
import { OfflineBanner } from '@/src/components/sync/banners';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const router = useRouter();
  const { account } = useAuthStore();
  const palette = useColors();

  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchData() {
    try {
      setError(null);
      const [dashboardData, notifData] = await Promise.all([
        getDashboard().catch(() => null),
        getNotifications({ limit: 3, unreadOnly: true }).catch(() => null),
      ]);
      setDashboard(dashboardData);
      setNotifications(notifData?.data ?? []);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchData();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <LoadingState label="Đang tải dữ liệu..." />
      </SafeAreaView>
    );
  }

  if (error && !dashboard) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ErrorState title="Không thể tải dữ liệu" message={error} onRetry={fetchData} />
      </SafeAreaView>
    );
  }

  const activeTrips = (dashboard?.activeTrips ?? []).filter((t) =>
    isActiveTrip(t.status)
  );
  const currentTrip = activeTrips[0];
  const hasVessels = (dashboard?.vessels?.length ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <OfflineBanner />
      <RefreshableScroll
        onRefresh={handleRefresh}
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 py-3 pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-3">
          <View className="flex-1">
            <Text variant="title2" className="font-bold">
              Xin chào!
            </Text>
            <Text variant="subhead" className="text-muted-foreground">
              {account?.fullName ?? account?.identifier ?? 'Người dùng'}
              {account?.accountType ? ` • ${account.accountType}` : ''}
            </Text>
          </View>
          <SyncStatusPill />
        </View>

        {/* Current trip CTA */}
        {currentTrip ? (
          <Pressable
            onPress={() => router.push(`/trips/${currentTrip.id}` as any)}
            accessibilityRole="button"
            accessibilityLabel={`Mở chuyến biển hiện tại ${currentTrip.vesselName ?? ''}`}
            className="mb-4 flex-row items-center gap-3 rounded-2xl bg-primary p-4 active:opacity-80"
            style={{
              minHeight: 64,
              paddingVertical: Spacing.md,
              borderCurve: 'continuous',
            }}>
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                borderRadius: Radius.pill,
                backgroundColor: palette.primaryForeground + '22',
              }}>
              <MaterialCommunityIcons
                name="anchor"
                size={26}
                color={palette.primaryForeground}
              />
            </View>
            <View className="flex-1">
              <Text
                variant="footnote"
                className="text-xs uppercase"
                style={{ color: palette.primaryForeground, opacity: 0.8 }}>
                Chuyến biển hiện tại
              </Text>
              <Text
                variant="title3"
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                {currentTrip.vesselName ?? currentTrip.vessel?.vesselName ?? 'Tàu'}
              </Text>
              <Text
                variant="caption1"
                style={{ color: palette.primaryForeground, opacity: 0.8 }}>
                {TRIP_STATUS_LABELS[currentTrip.status] ?? currentTrip.status}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color={palette.primaryForeground}
            />
          </Pressable>
        ) : (
          <Card className="mb-4">
            <View className="items-center gap-3 py-2">
              <MaterialCommunityIcons
                name="anchor"
                size={32}
                color={palette.textMuted}
              />
              <Text variant="subhead" className="text-center text-muted-foreground">
                Chưa có chuyến biển đang hoạt động
              </Text>
              <Button
                size="md"
                onPress={() => router.push('/trips/create' as any)}
                disabled={!hasVessels}>
                <MaterialCommunityIcons
                  name="plus"
                  size={18}
                  color={palette.primaryForeground}
                />
                <Text
                  className="font-semibold"
                  style={{ color: palette.primaryForeground }}>
                  Tạo chuyến biển
                </Text>
              </Button>
              {!hasVessels ? (
                <Text variant="caption1" className="mt-1 text-center text-muted-foreground">
                  Bạn cần được thêm vào tàu trước khi tạo chuyến biển.
                </Text>
              ) : null}
            </View>
          </Card>
        )}

        {/* My Vessels */}
        <Card className="mb-4">
          <View className="gap-3">
            <SectionHeader
              title="Tàu của tôi"
              actionLabel="Xem tất cả"
              onAction={() => router.push('/vessels' as any)}
            />

            {dashboard?.vessels && dashboard.vessels.length > 0 ? (
              <View className="gap-2">
                {dashboard.vessels.slice(0, 3).map((vessel) => (
                  <Pressable
                    key={vessel.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Mở tàu ${vessel.vesselName || vessel.registrationNumber}`}
                    className="flex-row items-center gap-3 rounded-xl p-3 active:bg-muted/50"
                    style={{ minHeight: 56 }}
                    onPress={() => router.push(`/vessels/${vessel.id}` as any)}>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: Radius.pill,
                        backgroundColor: palette.primary + '15',
                      }}>
                      <MaterialCommunityIcons
                        name="ferry"
                        size={20}
                        color={palette.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text variant="body" className="font-medium">
                        {vessel.vesselName || vessel.registrationNumber}
                      </Text>
                      <Text variant="footnote" className="text-muted-foreground">
                        Số ĐK: {vessel.registrationNumber}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor:
                          vessel.status === 'ACTIVE'
                            ? palette.successSurface
                            : palette.surfaceSecondary,
                      }}>
                      <Text
                        variant="caption1"
                        className="font-medium"
                        style={{
                          color:
                            vessel.status === 'ACTIVE' ? palette.success : palette.textMuted,
                        }}>
                        {VESSEL_STATUS_LABELS[vessel.status] ?? vessel.status}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <InlineEmpty
                icon="ferry"
                message="Chưa có tàu được phép"
              />
            )}
          </View>
        </Card>

        {/* Active Trips */}
        <Card className="mb-4">
          <View className="gap-3">
            <SectionHeader
              title="Chuyến đang hoạt động"
              actionLabel="Xem tất cả"
              onAction={() => router.push('/(app)/(tabs)/trips' as any)}
            />

            {activeTrips.length > 0 ? (
              <View className="gap-2">
                {activeTrips.slice(0, 3).map((trip) => {
                  const color = tripStatusColor(trip.status, palette);
                  const surface = tripStatusSurface(trip.status, palette);
                  return (
                    <Pressable
                      key={trip.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Mở chuyến ${trip.vesselName ?? 'Tàu'}`}
                      className="rounded-xl p-3 active:bg-muted/50"
                      style={{ minHeight: 56 }}
                      onPress={() => router.push(`/trips/${trip.id}` as any)}>
                      <View className="flex-row items-center gap-3">
                        <View
                          className="items-center justify-center rounded-full"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: Radius.pill,
                            backgroundColor: palette.primary + '15',
                          }}>
                          <MaterialCommunityIcons
                            name="ferry"
                            size={20}
                            color={palette.primary}
                          />
                        </View>
                        <View className="flex-1">
                          <Text variant="body" className="font-medium">
                            {trip.vesselName ?? trip.vessel?.vesselName ?? 'Tàu'}
                          </Text>
                          <Text variant="footnote" className="text-muted-foreground">
                            {trip.departureAt
                              ? new Date(trip.departureAt).toLocaleString('vi-VN')
                              : 'Chưa khởi hành'}
                          </Text>
                        </View>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: surface }}>
                          <Text
                            variant="caption1"
                            className="font-medium"
                            style={{ color }}>
                            {TRIP_STATUS_LABELS[trip.status] ?? trip.status}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <InlineEmpty
                icon="anchor"
                message="Không có chuyến đi đang hoạt động"
              />
            )}
          </View>
        </Card>

        {/* Recent Notifications */}
        <Card className="mb-4">
          <View className="gap-3">
            <SectionHeader title="Thông báo" />

            {notifications.length > 0 ? (
              <View className="gap-2">
                {notifications.map((notif) => (
                  <View
                    key={notif.id}
                    className="flex-row gap-3 rounded-xl p-3"
                    style={{
                      backgroundColor: !notif.isRead ? palette.primary + '0D' : 'transparent',
                    }}>
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: Radius.pill,
                        backgroundColor: palette.surfaceSecondary,
                      }}>
                      <MaterialCommunityIcons
                        name="bell-outline"
                        size={20}
                        color={palette.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text variant="subhead" className="font-medium">
                        {notif.title}
                      </Text>
                      <Text
                        variant="footnote"
                        className="text-muted-foreground"
                        numberOfLines={2}>
                        {notif.body}
                      </Text>
                    </View>
                    {!notif.isRead ? (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: Radius.pill,
                          backgroundColor: palette.primary,
                        }}
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <InlineEmpty
                icon="bell-off-outline"
                message="Không có thông báo mới"
              />
            )}
          </View>
        </Card>

        <View className="items-center py-4">
          <Text variant="caption1" className="text-muted-foreground">
            Phiên bản 1.0.0
          </Text>
        </View>
      </RefreshableScroll>
    </SafeAreaView>
  );
}
