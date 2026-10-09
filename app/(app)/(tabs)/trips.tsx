/**
 * Trips Tab — list of fishing trips.
 *
 * Maritime palette, semantic tokens. TripCard is palette-driven.
 * Touch targets meet the 48pt preferred size for the primary create CTA.
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableFlatList } from '@/components/ui/RefreshableScroll';
import { TripCard } from '@/src/components/domain/cards';
import { OfflineBanner } from '@/src/components/sync/banners';
import { useColors } from '@/src/design-system/use-colors';

import { getTrips, FishingTrip } from '@/src/api';

export default function TripsScreen() {
  const router = useRouter();
  const palette = useColors();

  const [trips, setTrips] = React.useState<FishingTrip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  async function fetchTrips(pageNum: number = 1) {
    try {
      if (pageNum === 1) setError(null);
      const response = await getTrips({ page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setTrips(response);
      } else {
        setTrips((prev) => [...prev, ...response]);
      }
      setHasMore(response.length >= 20);
      setPage(pageNum);
    } catch {
      setError('Không thể tải danh sách chuyến đi.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  React.useEffect(() => {
    void fetchTrips(1);
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await fetchTrips(1);
  }, []);

  function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    void fetchTrips(page + 1);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState label="Đang tải chuyến đi..." />
      </SafeAreaView>
    );
  }

  if (error && trips.length === 0) {
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
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text variant="title2" className="font-bold">
          Chuyến biển
        </Text>
        <Button
          size="md"
          onPress={() => router.push('/trips/create' as any)}
          accessibilityLabel="Tạo chuyến biển mới"
          style={{
            borderCurve: 'continuous',
            minHeight: 44,
            paddingHorizontal: 16,
          }}>
          <MaterialCommunityIcons
            name="plus"
            size={18}
            color={palette.primaryForeground}
          />
          <Text
            className="font-semibold"
            style={{ color: palette.primaryForeground }}>
            Tạo mới
          </Text>
        </Button>
      </View>
      <OfflineBanner />

      {trips.length === 0 ? (
        <EmptyState
          icon="anchor"
          title="Chưa có chuyến đi"
          description="Tạo chuyến biển đầu tiên để bắt đầu ghi nhật ký điện tử."
          actionLabel="Tạo chuyến đi"
          onAction={() => router.push('/trips/create' as any)}
        />
      ) : (
        <RefreshableFlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => router.push(`/trips/${item.id}` as any)}
            />
          )}
          onRefresh={handleRefresh}
          contentContainerClassName="pt-2 pb-6"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasMore && trips.length > 0 ? (
              <View className="items-center py-4">
                <Button
                  variant="tonal"
                  size="sm"
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  style={{ borderCurve: 'continuous', minHeight: 44 }}>
                  <Text style={{ color: palette.primary }}>
                    {loadingMore ? 'Đang tải…' : 'Tải thêm'}
                  </Text>
                </Button>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}