/**
 * Landing — record trip landing (final port of trip).
 * Sums up total catch weight from the trip operations for the fisherman.
 */

import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { ErrorState } from '@/components/ui/ErrorState';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { useColors } from '@/src/design-system/use-colors';
import {
  AppInput,
  AppTextArea,
  FormSection,
} from '@/src/components/forms/primitives';
import { DateTimeInput } from '@/src/components/forms/date-time';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import {
  getLandingRecords,
  getFishingOperations,
  LandingRecord,
  FishingOperation,
} from '@/src/api';

interface LandingForm {
  landingPortCode: string;
  landedAt: Date | null;
  notes: string;
}

const EMPTY_FORM: LandingForm = {
  landingPortCode: '',
  landedAt: new Date(),
  notes: '',
};

export default function TripLandingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [landings, setLandings] = React.useState<LandingRecord[]>([]);
  const [operations, setOperations] = React.useState<FishingOperation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<LandingForm>(EMPTY_FORM);

  async function fetch() {
    if (!id) return;
    try {
      setError(null);
      const [l, ops] = await Promise.all([
        getLandingRecords({ fishingTripId: id }),
        getFishingOperations({ fishingTripId: id, limit: 200 }),
      ]);
      setLandings(l);
      setOperations(ops);
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
    await fetch();
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

  async function handleSubmit() {
    if (!id) return;
    if (!form.landingPortCode.trim()) {
      notify.error('Vui lòng nhập cảng cập.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fishingTripId: id,
        landingPortCode: form.landingPortCode.trim(),
        landedAt: form.landedAt ? form.landedAt.toISOString() : undefined,
        notes: form.notes.trim() || undefined,
      };
      const result = await offlineWrite<LandingRecord>({
        endpoint: '/electronic-logbook/landing-records',
        method: 'POST',
        payload,
        entityType: 'landing-record',
        localState: payload,
      });
      if (result.kind === 'error') {
        notify.error(result.message);
        return;
      }
      notify.success(
        result.kind === 'queued' ? 'Đã lưu trên thiết bị' : 'Đã ghi nhận cập cảng'
      );
      setForm(EMPTY_FORM);
      setCreating(false);
      await fetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && landings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Cập cảng" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error && landings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Cập cảng" />
        <ErrorState
          title="Không thể tải dữ liệu cập cảng"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Cập cảng" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <RefreshableScroll
          onRefresh={handleRefresh}
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="px-4 py-4 pb-24"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 rounded-xl border border-border bg-card p-3">
            <Text variant="footnote" className="text-muted-foreground">
              Tổng sản lượng (ước tính)
            </Text>
            <Text variant="title2" className="mt-1 font-bold">
              {totalKg.toLocaleString('vi-VN')} kg
            </Text>
            <Text variant="footnote" className="mt-1 text-muted-foreground">
              {speciesCount} loài
            </Text>
          </View>

          {!creating ? (
            <>
              {landings.length === 0 ? (
                <InlineEmpty icon="anchor" message="Chưa ghi nhận cập cảng." />
              ) : (
                <View className="gap-2">
                  {landings.map((l) => (
                    <View
                      key={l.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <Text variant="subhead" className="font-semibold">
                        {l.landingPortCode ?? '—'}
                      </Text>
                      <Text variant="footnote" className="text-muted-foreground">
                        {l.landedAt ? new Date(l.landedAt).toLocaleString('vi-VN') : '—'}
                      </Text>
                      {l.totalQuantity ? (
                        <Text variant="footnote" className="text-muted-foreground">
                          Tổng: {l.totalQuantity.toLocaleString('vi-VN')} kg
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              <Button
                size="lg"
                onPress={() => setCreating(true)}
                accessibilityLabel="Ghi cập cảng mới"
                className="mt-6 w-full"
                style={{ borderCurve: 'continuous', minHeight: 48 }}>
                <Text
                  className="font-semibold"
                  style={{ color: palette.primaryForeground }}>
                  + Ghi cập cảng
                </Text>
              </Button>
            </>
          ) : (
            <>
              <FormSection title="Thông tin cập cảng">
                <AppInput
                  label="Cảng cập"
                  required
                  value={form.landingPortCode}
                  onChangeText={(v) => setForm((s) => ({ ...s, landingPortCode: v }))}
                  placeholder="VD: Cảng cá Rạch Giá"
                />
                <DateTimeInput
                  label="Ngày giờ cập"
                  required
                  value={form.landedAt}
                  onChange={(d) => setForm((s) => ({ ...s, landedAt: d ?? s.landedAt }))}
                />
                <AppTextArea
                  label="Ghi chú"
                  value={form.notes}
                  onChangeText={(v) => setForm((s) => ({ ...s, notes: v }))}
                  minHeight={80}
                />
              </FormSection>

              <View className="mt-4 flex-row gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => {
                    setCreating(false);
                    setForm(EMPTY_FORM);
                  }}
                  disabled={submitting}
                  accessibilityLabel="Huỷ"
                  className="flex-1"
                  style={{ borderCurve: 'continuous', minHeight: 48 }}>
                  <Text>Huỷ</Text>
                </Button>
                <Button
                  size="lg"
                  onPress={handleSubmit}
                  disabled={submitting}
                  accessibilityLabel="Lưu cập cảng"
                  className="flex-1"
                  style={{ borderCurve: 'continuous', minHeight: 48 }}>
                  <Text
                    className="font-semibold"
                    style={{ color: palette.primaryForeground }}>
                    {submitting ? 'Đang lưu…' : 'Lưu'}
                  </Text>
                </Button>
              </View>
            </>
          )}
        </RefreshableScroll>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
