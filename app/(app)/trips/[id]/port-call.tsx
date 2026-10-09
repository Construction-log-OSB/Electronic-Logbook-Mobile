/**
 * Port Calls — record arrival/departure events for the trip.
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
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { DateTimeInput } from '@/src/components/forms/date-time';
import { GPSInput } from '@/src/components/forms/gps';
import { PortCallRow } from '@/src/components/domain/cards';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import { getPortCalls, PortCall } from '@/src/api';

import { PORT_CALL_TYPE_LABELS } from '@/src/domain/types';

interface PortCallForm {
  portCode: string;
  callType: 'DEPARTURE' | 'ARRIVAL' | 'TRANSIT' | 'EMERGENCY';
  occurredAt: Date | null;
  reason: string;
  notes: string;
  lat: number | null;
  lng: number | null;
}

const EMPTY_FORM: PortCallForm = {
  portCode: '',
  callType: 'ARRIVAL',
  occurredAt: new Date(),
  reason: '',
  notes: '',
  lat: null,
  lng: null,
};

export default function TripPortCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [records, setRecords] = React.useState<PortCall[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<PortCallForm>(EMPTY_FORM);

  async function fetch() {
    if (!id) return;
    try {
      setError(null);
      const data = await getPortCalls({ fishingTripId: id });
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
    if (!form.portCode.trim()) {
      notify.error('Vui lòng nhập mã cảng.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fishingTripId: id,
        portCode: form.portCode.trim(),
        callType: form.callType,
        occurredAt: form.occurredAt ? form.occurredAt.toISOString() : undefined,
        reason: form.reason.trim() || undefined,
        notes: form.notes.trim() || undefined,
        latitude: form.lat ?? undefined,
        longitude: form.lng ?? undefined,
      };
      const result = await offlineWrite<PortCall>({
        endpoint: '/electronic-logbook/port-calls',
        method: 'POST',
        payload,
        entityType: 'port-call',
        localState: payload,
      });
      if (result.kind === 'error') {
        notify.error(result.message);
        return;
      }
      notify.success(
        result.kind === 'queued' ? 'Đã lưu trên thiết bị' : 'Đã ghi cập cảng'
      );
      setForm({ ...EMPTY_FORM, callType: form.callType });
      setCreating(false);
      await fetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && records.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Cập cảng" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Cập cảng" />
        <ErrorState
          title="Không thể tải bản ghi cập cảng"
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
          {!creating ? (
            <>
              {records.length === 0 ? (
                <InlineEmpty icon="anchor" message="Chưa có bản ghi cập cảng." />
              ) : (
                <View className="gap-2">
                  {records.map((r) => (
                    <PortCallRow key={r.id} portCall={r} />
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
              <FormSection title="Cập cảng" description="Ghi nhận mỗi lần tàu cập/rời cảng.">
                <BottomSheetSelect
                  label="Loại cập cảng"
                  required
                  value={form.callType}
                  onChange={(v) => setForm((s) => ({ ...s, callType: v as PortCallForm['callType'] }))}
                  options={Object.entries(PORT_CALL_TYPE_LABELS).map(([k, label]) => ({
                    label,
                    value: k,
                  }))}
                />
                <AppInput
                  label="Mã cảng"
                  required
                  value={form.portCode}
                  onChangeText={(v) => setForm((s) => ({ ...s, portCode: v }))}
                  placeholder="VD: VICT, HCM"
                  autoCapitalize="characters"
                />
                <DateTimeInput
                  label="Thời gian"
                  required
                  value={form.occurredAt}
                  onChange={(d) => setForm((s) => ({ ...s, occurredAt: d ?? s.occurredAt }))}
                />
            <GPSInput
              label="Tọa độ"
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
                <AppInput
                  label="Lý do"
                  value={form.reason}
                  onChangeText={(v) => setForm((s) => ({ ...s, reason: v }))}
                  placeholder="VD: Trú bão, hết lương thực…"
                />
                <AppTextArea
                  label="Ghi chú"
                  value={form.notes}
                  onChangeText={(v) => setForm((s) => ({ ...s, notes: v }))}
                  minHeight={60}
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
