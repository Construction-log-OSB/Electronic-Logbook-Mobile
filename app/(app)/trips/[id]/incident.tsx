/**
 * Incidents — quick incident reporting for the trip.
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
  AppTextArea,
  FormSection,
} from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { DateTimeInput } from '@/src/components/forms/date-time';
import { GPSInput } from '@/src/components/forms/gps';
import { PhotoPicker, DocFilePicker } from '@/src/components/forms/pickers';
import { IncidentCard } from '@/src/components/domain/cards';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import { getIncidents, Incident } from '@/src/api';

import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from '@/src/domain/types';

interface IncidentForm {
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurredAt: Date | null;
  description: string;
  actionTaken: string;
  lat: number | null;
  lng: number | null;
  photo: { uri: string; name: string; type: string } | null;
  doc: { uri: string; name: string; type: string } | null;
}

const EMPTY_FORM: IncidentForm = {
  incidentType: '',
  severity: 'LOW',
  occurredAt: new Date(),
  description: '',
  actionTaken: '',
  lat: null,
  lng: null,
  photo: null,
  doc: null,
};

export default function TripIncidentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<IncidentForm>(EMPTY_FORM);

  async function fetch() {
    if (!id) return;
    try {
      setError(null);
      const data = await getIncidents({ fishingTripId: id });
      setIncidents(data);
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
    if (!form.incidentType) {
      notify.error('Vui lòng chọn loại sự cố.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        vesselId: undefined, // backend derives from trip
        fishingTripId: id,
        incidentType: form.incidentType,
        severity: form.severity,
        occurredAt: form.occurredAt ? form.occurredAt.toISOString() : undefined,
        description: form.description.trim() || undefined,
        actionTaken: form.actionTaken.trim() || undefined,
        latitude: form.lat ?? undefined,
        longitude: form.lng ?? undefined,
      } as Record<string, unknown>;
      const result = await offlineWrite<Incident>({
        endpoint: '/electronic-logbook/incidents',
        method: 'POST',
        payload,
        entityType: 'incident',
        localState: payload,
      });
      if (result.kind === 'error') {
        notify.error(result.message);
        return;
      }
      notify.success(
        result.kind === 'queued' ? 'Đã lưu trên thiết bị' : 'Đã báo cáo sự cố'
      );
      setForm(EMPTY_FORM);
      setCreating(false);
      await fetch();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && incidents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Sự cố" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error && incidents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Sự cố" />
        <ErrorState
          title="Không thể tải sự cố"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Sự cố" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
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
            {incidents.length === 0 ? (
              <InlineEmpty icon="alert-outline" message="Chưa có sự cố nào." />
            ) : (
              <View className="gap-2">
                {incidents.map((inc) => (
                  <IncidentCard key={inc.id} incident={inc} />
                ))}
              </View>
            )}

            <Button
              size="lg"
              onPress={() => setCreating(true)}
              accessibilityLabel="Báo sự cố mới"
              className="mt-6 w-full"
              style={{ borderCurve: 'continuous', minHeight: 48 }}>
              <Text
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                + Báo sự cố
              </Text>
            </Button>
          </>
        ) : (
          <>
            <FormSection
              title="Báo sự cố"
              description="Chỉ mất 30 giây. Mô tả ngắn gọn + ảnh nếu có."
            >
              <BottomSheetSelect
                label="Loại sự cố"
                required
                value={form.incidentType || null}
                onChange={(v) => setForm((s) => ({ ...s, incidentType: String(v) }))}
                options={Object.entries(INCIDENT_TYPE_LABELS).map(([k, label]) => ({
                  label,
                  value: k,
                }))}
                placeholder="Chọn loại sự cố"
              />
              <BottomSheetSelect
                label="Mức độ"
                required
                value={form.severity}
                onChange={(v) => setForm((s) => ({ ...s, severity: v as IncidentForm['severity'] }))}
                options={Object.entries(INCIDENT_SEVERITY_LABELS).map(([k, label]) => ({
                  label,
                  value: k,
                }))}
              />
              <DateTimeInput
                label="Thời gian xảy ra"
                required
                value={form.occurredAt}
                onChange={(d) => setForm((s) => ({ ...s, occurredAt: d ?? s.occurredAt }))}
              />
          <GPSInput
            label="Vị trí"
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
              <AppTextArea
                label="Mô tả"
                required
                value={form.description}
                onChangeText={(v) => setForm((s) => ({ ...s, description: v }))}
                placeholder="Mô tả ngắn gọn về sự cố"
                minHeight={80}
              />
              <AppTextArea
                label="Đã xử lý"
                value={form.actionTaken}
                onChangeText={(v) => setForm((s) => ({ ...s, actionTaken: v }))}
                placeholder="Các biện pháp đã xử lý"
                minHeight={60}
              />
            </FormSection>

            <FormSection title="Bằng chứng (tuỳ chọn)">
            <PhotoPicker
              label="Ảnh bằng chứng (tuỳ chọn)"
              value={form.photo}
              onChange={(photo) => setForm((s) => ({ ...s, photo }))}
            />
            <DocFilePicker
              label="Tài liệu (tuỳ chọn)"
              value={form.doc}
              onChange={(doc) => setForm((s) => ({ ...s, doc }))}
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
                accessibilityLabel="Lưu sự cố"
                className="flex-1"
                style={{ borderCurve: 'continuous', minHeight: 48 }}>
                <Text
                  className="font-semibold"
                  style={{ color: palette.primaryForeground }}>
                  {submitting ? 'Đang lưu…' : 'Lưu sự cố'}
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
