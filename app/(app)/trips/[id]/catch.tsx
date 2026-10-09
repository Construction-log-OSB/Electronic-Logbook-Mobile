/**
 * Catch Overview — top-level summary of all catches recorded for a trip.
 *
 * Reuses the operations screen data; the standalone "Ghi sản lượng" CTA on
 * the trip workspace is mostly a fallback for cases where the user wants to
 * log a catch without creating a separate operation.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nativewindui/Text';
import { Button } from '@/components/nativewindui/Button';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { ErrorState } from '@/components/ui/ErrorState';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { OperationCard } from '@/src/components/domain/cards';
import { friendlyApiError } from '@/src/lib/error-messages';
import { useColors } from '@/src/design-system/use-colors';

import { getFishingOperations, FishingOperation } from '@/src/api';

export default function TripCatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [operations, setOperations] = React.useState<FishingOperation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const data = await getFishingOperations({ fishingTripId: id, limit: 100 });
        setOperations(data);
      } catch (err: unknown) {
        setError(friendlyApiError((err as { message?: string })?.message));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await getFishingOperations({ fishingTripId: id, limit: 100 });
      setOperations(data);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    }
  }, [id]);

  const totalKg = operations.reduce(
    (sum, op) =>
      sum +
      (op.catches ?? []).reduce(
        (s, c) => s + (c.unit === 'kg' || !c.unit ? Number(c.quantity ?? 0) : 0),
        0
      ),
    0
  );
  const speciesCount = new Set(
    operations.flatMap((o) => (o.catches ?? []).map((c) => c.speciesName ?? ''))
  ).size;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Sản lượng" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && operations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Sản lượng" />
        <ErrorState
          title="Không thể tải sản lượng"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Sản lượng" />
      <RefreshableScroll
        onRefresh={handleRefresh}
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 py-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mb-4 rounded-xl border p-3"
          style={{ borderColor: palette.border, backgroundColor: palette.surface }}>
          <Text variant="footnote" className="text-muted-foreground">
            Tổng sản lượng
          </Text>
          <Text variant="title2" className="mt-1 font-bold">
            {totalKg.toLocaleString('vi-VN')} kg
          </Text>
          <Text variant="footnote" className="mt-1 text-muted-foreground">
            {speciesCount} loài · {operations.length} mẻ khai thác
          </Text>
        </View>

        {operations.length === 0 ? (
          <InlineEmpty
            icon="fish"
            message="Chưa có sản lượng nào. Hãy ghi ít nhất một hoạt động khai thác."
          />
        ) : (
          <View className="gap-2">
            {operations
              .filter((op) => (op.catches?.length ?? 0) > 0)
              .map((op) => (
                <OperationCard key={op.id} op={op} />
              ))}
          </View>
        )}

        <Button
          size="lg"
          onPress={() => router.push(`/trips/${id}/operation` as any)}
          accessibilityLabel="Ghi mẻ khai thác mới"
          className="mt-6 w-full"
          style={{ borderCurve: 'continuous', minHeight: 48 }}>
          <Text
            className="font-semibold"
            style={{ color: palette.primaryForeground }}>
            + Ghi mẻ khai thác mới
          </Text>
        </Button>
      </RefreshableScroll>
    </SafeAreaView>
  );
}