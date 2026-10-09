/**
 * Forms — display and manage M01 / M02 / M03 forms for a trip.
 *
 * Each row pulls its lifecycle status from the trip overview and routes the
 * user to the correct editor / view via the `code` path. The full form fill /
 * edit lives in `forms/[code].tsx` (dynamic route).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nativewindui/Text';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { FormStatusRow } from '@/src/components/domain/cards';
import { friendlyApiError } from '@/src/lib/error-messages';

import { getTripOverview, type TripOverview } from '@/src/api';

import { FORM_CODE_LABELS } from '@/src/domain/types';

const FORM_CODES = ['M01', 'M02', 'M03'] as const;

type FormSlot = 'm01' | 'm02' | 'm03';

export default function TripFormsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [overview, setOverview] = React.useState<TripOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function fetch(opts?: { isRefresh?: boolean }) {
    if (!id) return;
    try {
      if (opts?.isRefresh) {
        setError(null);
      }
      const data = await getTripOverview(id);
      setOverview(data);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    void fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetch({ isRefresh: true });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Biểu mẫu" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !overview) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Biểu mẫu" />
        <ErrorState
          title="Không thể tải biểu mẫu"
          message={error}
          onRetry={() => fetch()}
        />
      </SafeAreaView>
    );
  }

  const forms = overview?.forms ?? {};

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Biểu mẫu bắt buộc" />
      <RefreshableScroll
        onRefresh={handleRefresh}
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 py-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" className="mb-6 text-muted-foreground">
          Ba biểu mẫu bắt buộc theo quy định Thông tư 04/2014/TT-BNNPTNT.
          Mỗi biểu mẫu gắn với một giai đoạn của chuyến biển.
        </Text>

        <View className="gap-3">
          {FORM_CODES.map((code) => (
            <FormStatusRow
              key={code}
              code={code}
              form={forms[code.toLowerCase() as FormSlot]}
              onPress={() => router.push(`/trips/${id}/forms/${code}` as any)}
            />
          ))}
        </View>

        <View className="mt-6 rounded-xl border border-border bg-card p-4">
          <Text variant="heading" className="font-semibold">
            Hướng dẫn nhanh
          </Text>
          <View className="mt-3 gap-2">
            <FormGuidanceItem
              code="M03"
              label={FORM_CODE_LABELS['M03']}
              description="Gửi TRƯỚC khi rời cảng — khai báo tàu, thuyền viên, thiết bị."
            />
            <FormGuidanceItem
              code="M01"
              label={FORM_CODE_LABELS['M01']}
              description="Gửi KHI cập cảng — biên nhận bốc dỡ sản lượng khai thác."
            />
            <FormGuidanceItem
              code="M02"
              label={FORM_CODE_LABELS['M02']}
              description="Gửi SAU khi cập cảng — biên bản kiểm tra cập cảng."
            />
          </View>
        </View>
      </RefreshableScroll>
    </SafeAreaView>
  );
}

function FormGuidanceItem({
  code,
  label,
  description,
}: {
  code: string;
  label: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="min-w-[48px] items-center rounded-full bg-muted px-2 py-1">
        <Text variant="caption2" className="font-semibold text-foreground">
          {code}
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="subhead" className="font-medium">
          {label}
        </Text>
        <Text variant="caption1" className="text-muted-foreground">
          {description}
        </Text>
      </View>
    </View>
  );
}