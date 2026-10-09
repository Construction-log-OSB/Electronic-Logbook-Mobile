/**
 * Vessel Detail Screen — read-only view of the user's vessel.
 *
 * Maritime palette tokens, shared InfoRow, semantic status pill,
 * 48pt primary CTA.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { InfoRow } from '@/components/ui/InfoRow';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { OfflineBanner } from '@/src/components/sync/banners';
import { CREW_ROLE_LABELS, VESSEL_STATUS_LABELS } from '@/src/domain/types';
import { useColors } from '@/src/design-system/use-colors';
import { Radius } from '@/src/design-system/tokens';

import { getVessel, getVesselCrew, getVesselGear, Vessel, VesselCrew, VesselGear } from '@/src/api';

export default function VesselDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const palette = useColors();

  const [vessel, setVessel] = React.useState<Vessel | null>(null);
  const [crew, setCrew] = React.useState<VesselCrew[]>([]);
  const [gear, setGear] = React.useState<VesselGear[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchData() {
    if (!id) return;
    try {
      setError(null);
      const [vesselData, crewData, gearData] = await Promise.all([
        getVessel(id).catch(() => null),
        getVesselCrew(id).catch(() => []),
        getVesselGear(id).catch(() => []),
      ]);
      setVessel(vesselData);
      setCrew(crewData);
      setGear(gearData);
    } catch {
      setError('Không thể tải thông tin tàu.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchData();
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    await fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Thông tin tàu" />
        <LoadingState label="Đang tải thông tin tàu..." />
      </SafeAreaView>
    );
  }

  if (error && !vessel) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Thông tin tàu" />
        <ErrorState title="Không thể tải dữ liệu" message={error} onRetry={fetchData} />
      </SafeAreaView>
    );
  }

  if (!vessel) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Thông tin tàu" />
        <EmptyState
          icon="ferry"
          title="Không tìm thấy tàu"
          description="Tàu này có thể không tồn tại hoặc bạn không có quyền truy cập."
        />
      </SafeAreaView>
    );
  }

  const isActive = vessel.status === 'ACTIVE';
  crew?.length > 0 ? crew.filter((c) => c.isActive) : [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader
        title={vessel.vesselName || 'Tàu'}
        subtitle={vessel.registrationNumber}
      />
      <OfflineBanner />
      <RefreshableScroll
        onRefresh={handleRefresh}
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 py-3 pb-8">
        {/* Hero */}
        <View className="mb-4 items-center gap-3">
          <View
            className="items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: Radius.pill,
              backgroundColor: palette.primary,
            }}>
            <MaterialCommunityIcons
              name="ferry"
              size={40}
              color={palette.primaryForeground}
            />
          </View>
          <View className="items-center gap-1">
            <Text variant="title2" className="text-center font-bold">
              {vessel.vesselName || '—'}
            </Text>
            <Text variant="subhead" className="text-muted-foreground">
              Số đăng ký: {vessel.registrationNumber}
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: isActive
                ? palette.successSurface
                : palette.surfaceSecondary,
            }}>
            <Text
              variant="subhead"
              className="font-medium"
              style={{
                color: isActive ? palette.success : palette.textMuted,
              }}>
              {VESSEL_STATUS_LABELS[vessel.status] ?? vessel.status}
            </Text>
          </View>
        </View>

        {/* Vessel Info (read-only) */}
        <Card className="mb-4">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="heading" className="font-semibold">
                Thông tin tàu
              </Text>
              <Text variant="caption1" className="text-muted-foreground">
                Chỉ xem
              </Text>
            </View>
            <InfoRow label="Loại tàu" value={vessel.vesselType ?? '—'} />
            <InfoRow
              label="Chiều dài"
              value={vessel.length ? `${vessel.length} m` : '—'}
            />
            <InfoRow
              label="Dung tích"
              value={vessel.grossTonnage ? `${vessel.grossTonnage} GT` : '—'}
            />
            <InfoRow
              label="Công suất máy"
              value={vessel.enginePower ? `${vessel.enginePower} HP` : '—'}
            />
          </View>
        </Card>

        {/* Crew */}
        <Card className="mb-4">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="heading" className="font-semibold">
                Thuyền viên thường trực
              </Text>
              <Text variant="footnote" className="text-muted-foreground">
                {crew?.length > 0 ? crew.filter((c) => c.isActive).length : 0} người
              </Text>
            </View>
            {crew?.length > 0 && crew.filter((c) => c.isActive).length > 0 ? (
              <View className="gap-2">
                {crew.filter((c) => c.isActive).map((member) => (
                  <View
                    key={member.id}
                    className="flex-row items-center gap-3 rounded-xl p-2"
                    style={{
                      minHeight: 56,
                      backgroundColor: palette.surfaceSecondary,
                    }}>
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: Radius.pill,
                        backgroundColor: palette.surfaceElevated,
                      }}>
                      <MaterialCommunityIcons
                        name="account"
                        size={18}
                        color={palette.textMuted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text variant="subhead" className="font-medium">
                        {member.fullName ?? member.fishermanCode ?? '—'}
                      </Text>
                      <Text variant="caption1" className="text-muted-foreground">
                        {CREW_ROLE_LABELS[member.crewRole] ?? member.crewRole}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <InlineEmpty icon="account-off-outline" message="Chưa có thuyền viên" />
            )}
          </View>
        </Card>

        {/* Fishing Gear */}
        <Card className="mb-4">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="heading" className="font-semibold">
                Ngư cụ
              </Text>
              <Text variant="footnote" className="text-muted-foreground">
                {gear?.length > 0 ? gear.length : 0} loại
              </Text>
            </View>
            {gear?.length > 0 ? (
              <View className="gap-2">
                {gear.map((g) => (
                  <View
                    key={g.id}
                    className="flex-row items-center justify-between rounded-xl px-3 py-2"
                    style={{ minHeight: 48, backgroundColor: palette.surfaceSecondary }}>
                    <View className="flex-row items-center gap-2">
                      <MaterialCommunityIcons
                        name="fishbowl-outline"
                        size={16}
                        color={palette.textMuted}
                      />
                      <Text variant="subhead">{g.name}</Text>
                    </View>
                    <Text variant="footnote" className="text-muted-foreground">
                      x{g.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <InlineEmpty icon="fishbowl-outline" message="Chưa có ngư cụ" />
            )}
          </View>
        </Card>

        <Button
          size="lg"
          onPress={() => router.push('/trips/create' as any)}
          accessibilityLabel="Tạo chuyến biển mới cho tàu này"
          className="mt-2 w-full"
          style={{ borderCurve: 'continuous', minHeight: 48 }}>
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={palette.primaryForeground}
          />
          <Text
            className="font-semibold"
            style={{ color: palette.primaryForeground }}>
            Tạo chuyến biển mới cho tàu này
          </Text>
        </Button>
      </RefreshableScroll>
    </SafeAreaView>
  );
}