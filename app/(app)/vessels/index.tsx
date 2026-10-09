/**
 * Vessel List Screen — "Tàu của tôi".
 *
 * Lists all vessels accessible to the authenticated user. Mobile never
 * creates arbitrary vessels — that's a backend/admin operation.
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { RefreshableFlatList } from '@/components/ui/RefreshableScroll';
import { OfflineBanner } from '@/src/components/sync/banners';
import { VesselCard } from '@/src/components/domain/cards';
import { getVessels, Vessel } from '@/src/api';

export default function VesselListScreen() {
  const router = useRouter();

  const [vessels, setVessels] = React.useState<Vessel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchVessels() {
    try {
      setError(null);
      const response = await getVessels({ limit: 50 });
      setVessels(response);
    } catch {
      setError('Không thể tải danh sách tàu.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchVessels();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    await fetchVessels();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Tàu của tôi" showBack />
        <LoadingState label="Đang tải tàu..." />
      </SafeAreaView>
    );
  }

  if (error && vessels.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Tàu của tôi" showBack />
        <ErrorState
          title="Không thể tải dữ liệu"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Tàu của tôi" showBack />
      <OfflineBanner />
      {vessels.length === 0 ? (
        <EmptyState
          icon="ferry"
          title="Chưa có tàu"
          description="Bạn chưa được phân quyền trên bất kỳ tàu nào. Liên hệ quản trị viên để được bổ sung vào tàu."
        />
      ) : (
        <RefreshableFlatList
          data={vessels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VesselCard
              vessel={item}
              onPress={() => router.push(`/vessels/${item.id}` as any)}
            />
          )}
          onRefresh={handleRefresh}
          contentContainerClassName="pt-2 pb-6"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
