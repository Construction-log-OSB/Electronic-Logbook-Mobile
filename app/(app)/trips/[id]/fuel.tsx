/**
 * Fuel Records — log fuel consumption / refuel events for a trip.
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
  FormSection,
  NumericInput,
} from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { DateTimeInput } from '@/src/components/forms/date-time';
import { GPSInput } from '@/src/components/forms/gps';
import { FuelRecordCard } from '@/src/components/domain/cards';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import { getFuelRecords, FuelRecord } from '@/src/api';

import { FUEL_TYPE_LABELS } from '@/src/domain/types';

interface FuelForm {
  recordType: 'BEFORE_DEPARTURE' | 'REFUEL' | 'CONSUMPTION' | 'ARRIVAL';
  quantity: string;
  unit: string;
  occurredAt: Date | null;
  location: string;
  notes: string;
  lat: number | null;
  lng: number | null;
}

const EMPTY_FORM: FuelForm = {
  recordType: 'REFUEL',
  quantity: '',
  unit: 'lít',
  occurredAt: new Date(),
  location: '',
  notes: '',
  lat: null,
  lng: null,
};

export default function TripFuelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [records, setRecords] = React.useState<FuelRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FuelForm>(EMPTY_FORM);

  async function fetch() {
    if (!id) return;
    try {
      setError(null);
      const data = await getFuelRecords({ fishingTripId: id });
      setRecords(data);
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

  async function handleSubmit() {
    if (!id) return;
    if (!form.quantity) {
      notify.error('Vui lòng nhập số lượng nhiên liệu.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fishingTripId: id,
        recordType: form.recordType,
        quantity: Number(form.quantity),
        unit: form.unit || 'lít',
        occurredAt: form.occurredAt ? form.occurredAt.toISOString() : undefined,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      const result = await offlineWrite<FuelRecord>({
        endpoint: '/electronic-logbook/fuel-records',
        method: 'POST',
        payload,
        entityType: 'fuel-record',
        localState: payload,
      });
      if (result.kind === 'error') {
        notify.error(result.message);
        return;
      }
      notify.success(
        result.kind === 'queued' ? 'Đã lưu trên thiết bị' : 'Đã ghi nhiên liệu'
      );
      setForm(EMPTY_FORM);
      setCreating(false);
      await fetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Nhiên liệu" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Nhiên liệu" />
        <ErrorState
          title="Không thể tải nhiên liệu"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Nhiên liệu" />
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
        {!creating ? (
          <>
            {records.length === 0 ? (
              <InlineEmpty icon="fuel" message="Chưa có bản ghi nhiên liệu." />
            ) : (
              <View className="gap-2">
                {records.map((r) => (
                  <FuelRecordCard key={r.id} fuel={r} />
                ))}
              </View>
            )}

            <Button
              size="lg"
              onPress={() => setCreating(true)}
              accessibilityLabel="Ghi nhiên liệu mới"
              className="mt-6 w-full"
              style={{ borderCurve: 'continuous', minHeight: 48 }}>
              <Text
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                + Ghi nhiên liệu
              </Text>
            </Button>
          </>
        ) : (
          <>
            <FormSection
              title="Bản ghi nhiên liệu"
              description="Ghi nhận số lượng nhiên liệu trước/sau mỗi giai đoạn chuyến biển."
            >
              <BottomSheetSelect
                label="Loại bản ghi"
                required
                value={form.recordType}
                onChange={(v) => setForm((s) => ({ ...s, recordType: v as FuelForm['recordType'] }))}
                options={Object.entries(FUEL_TYPE_LABELS).map(([k, label]) => ({
                  label,
                  value: k,
                }))}
              />
              <DateTimeInput
                label="Thời gian"
                required
                value={form.occurredAt}
                onChange={(d) => setForm((s) => ({ ...s, occurredAt: d ?? s.occurredAt }))}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <NumericInput
                    label="Số lượng"
                    required
                    allowDecimal
                    minValue={0}
                    value={form.quantity}
                    onChangeText={(v) => setForm((s) => ({ ...s, quantity: v }))}
                    placeholder="0"
                  />
                </View>
                <View className="w-32">
                  <AppInput
                    label="Đơn vị"
                    value={form.unit}
                    onChangeText={(v) => setForm((s) => ({ ...s, unit: v }))}
                    placeholder="lít"
                  />
                </View>
              </View>
              <AppInput
                label="Vị trí"
                value={form.location}
                onChangeText={(v) => setForm((s) => ({ ...s, location: v }))}
                placeholder="Tại cảng / trên biển"
              />
          <GPSInput
            label="Tọa độ GPS"
            latitude={form.lat ?? null}
            longitude={form.lng ?? null}
            onChange={(lat, lng) =>
              setForm((s) => ({
                ...s,
                lat: lat ?? null,
                lng: lng ?? null,
              }))
            }
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
                accessibilityLabel="Lưu bản ghi nhiên liệu"
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
