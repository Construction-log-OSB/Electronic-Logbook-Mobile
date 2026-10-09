/**
 * Fishing Operations — record a new fishing operation (with optional catches).
 *
 * Operation is a fast entry form:
 *  - Operation type (BottomSheet select)
 *  - Fishing gear (BottomSheet select)
 *  - Fishing ground (text)
 *  - Start / End time (DateTimeInput)
 *  - GPS location (GPSInput)
 *  - Depth (NumericInput, decimal)
 *  - Catches (repeatable CatchItemForm)
 *
 * Backend enforces that the trip is in a state where operations may be
 * recorded (typically FISHING / DEPARTED).
 */

import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  NumericInput,
} from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { DateTimeInput } from '@/src/components/forms/date-time';
import { GPSInput } from '@/src/components/forms/gps';
import { CatchItemForm } from '@/src/components/domain/catch-item-form';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import {
  getFishingOperations,
  FishingOperation,
} from '@/src/api';

import { OPERATION_TYPE_LABELS } from '@/src/domain/types';

const OPERATION_TYPE_KEYS = Object.keys(OPERATION_TYPE_LABELS);

interface CatchDraft {
  speciesName: string;
  quantity: string; // raw text for typing
  unit: string;
  condition: string;
}

const EMPTY_OP: {
  operationType: string;
  fishingGearType: string;
  fishingGround: string;
  startedAt: Date | null;
  endedAt: Date | null;
  depth: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  catches: CatchDraft[];
} = {
  operationType: '',
  fishingGearType: '',
  fishingGround: '',
  startedAt: null,
  endedAt: null,
  depth: '',
  notes: '',
  lat: null,
  lng: null,
  catches: [],
};

export default function TripOperationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [operations, setOperations] = React.useState<FishingOperation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(EMPTY_OP);

  async function fetchOperations() {
    if (!id) return;
    try {
      setError(null);
      const data = await getFishingOperations({ fishingTripId: id, limit: 50 });
      setOperations(data);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchOperations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    await fetchOperations();
  }, [id]);

  function addCatch() {
    setForm((s) => ({
      ...s,
      catches: [...s.catches, { speciesName: '', quantity: '', unit: 'kg', condition: '' }],
    }));
  }

  function updateCatch(idx: number, patch: Partial<CatchDraft>) {
    setForm((s) => ({
      ...s,
      catches: s.catches.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  }

  function removeCatch(idx: number) {
    setForm((s) => ({
      ...s,
      catches: s.catches.filter((_, i) => i !== idx),
    }));
  }

  async function handleSubmit() {
    if (!id) return;
    if (!form.operationType) {
      notify.error('Vui lòng chọn loại hoạt động.');
      return;
    }
    if (!form.startedAt) {
      notify.error('Vui lòng nhập thời gian bắt đầu.');
      return;
    }
    setSubmitting(true);
    try {
      const opPayload = {
        fishingTripId: id,
        operationType: form.operationType,
        fishingGearType: form.fishingGearType || undefined,
        fishingGround: form.fishingGround.trim() || undefined,
        operationStartedAt: form.startedAt.toISOString(),
        operationEndedAt: form.endedAt ? form.endedAt.toISOString() : undefined,
        latitude: form.lat ?? undefined,
        longitude: form.lng ?? undefined,
        depth: form.depth ? Number(form.depth) : undefined,
        notes: form.notes.trim() || undefined,
      };
      const result = await offlineWrite<FishingOperation>({
        endpoint: '/electronic-logbook/fishing-operations',
        method: 'POST',
        payload: opPayload,
        entityType: 'fishing-operation',
        localState: opPayload,
      });
      if (result.kind === 'error') {
        notify.error(result.message);
        return;
      }
      const opId =
        result.kind === 'ok' ? (result.data as FishingOperation).id : null;

      // Save catches if any (only when online — offline catches will be added
      // once the operation is synced, to preserve referential integrity).
      if (opId) {
        for (const c of form.catches) {
          if (!c.speciesName.trim() || !c.quantity) continue;
          try {
            await offlineWrite({
              endpoint: '/electronic-logbook/catch-records',
              method: 'POST',
              payload: {
                fishingOperationId: opId,
                speciesName: c.speciesName.trim(),
                quantity: Number(c.quantity),
                unit: c.unit || 'kg',
                condition: c.condition.trim() || undefined,
              },
              entityType: 'catch-record',
            });
          } catch {
            // tolerated; one bad catch should not block the operation save
          }
        }
      }

      notify.success(
        result.kind === 'queued' ? 'Đã lưu trên thiết bị' : 'Đã ghi hoạt động'
      );
      setForm(EMPTY_OP);
      setCreating(false);
      await fetchOperations();
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(op: FishingOperation) {
    Alert.alert('Xoá hoạt động?', 'Hoạt động này sẽ bị xoá khỏi chuyến biển.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const result = await offlineWrite({
            endpoint: `/electronic-logbook/fishing-operations/${op.id}`,
            method: 'DELETE',
            entityType: 'fishing-operation',
            entityId: op.id,
          });
          if (result.kind === 'error') notify.error(result.message);
          else {
            notify.success('Đã xoá');
            await fetchOperations();
          }
        },
      },
    ]);
  }

  if (error && operations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Hoạt động khai thác" />
        <ErrorState
          title="Không thể tải hoạt động khai thác"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Hoạt động khai thác" />
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
            {operations.length === 0 ? (
              <InlineEmpty icon="anchor" message="Chưa có hoạt động khai thác nào." />
            ) : (
              <View className="gap-2">
                {operations.map((op) => (
                  <View key={op.id}>
                    <OperationCard
                      op={op}
                      onDelete={() => handleDelete(op)}
                    />
                  </View>
                ))}
              </View>
            )}

            <Button
              size="lg"
              onPress={() => setCreating(true)}
              accessibilityLabel="Ghi hoạt động khai thác mới"
              className="mt-6 w-full"
              style={{ borderCurve: 'continuous', minHeight: 48 }}
            >
              <Text
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                + Ghi hoạt động
              </Text>
            </Button>
          </>
        ) : (
          <>
            <FormSection
              title="Hoạt động khai thác"
              description="Ghi nhận một mẻ khai thác. Các trường có dấu * bắt buộc."
            >
              <BottomSheetSelect
                label="Loại hoạt động"
                required
                value={form.operationType || null}
                onChange={(v) => setForm((s) => ({ ...s, operationType: String(v) }))}
                options={OPERATION_TYPE_KEYS.map((k) => ({
                  label: OPERATION_TYPE_LABELS[k],
                  value: k,
                }))}
                placeholder="Chọn loại hoạt động"
              />
              <BottomSheetSelect
                label="Ngư cụ"
                value={form.fishingGearType || null}
                onChange={(v) =>
                  setForm((s) => ({ ...s, fishingGearType: String(v) }))
                }
                options={OPERATION_TYPE_KEYS.map((k) => ({
                  label: OPERATION_TYPE_LABELS[k],
                  value: k,
                }))}
                placeholder="Chọn ngư cụ"
              />
              <AppInput
                label="Ngư trường"
                value={form.fishingGround}
                onChangeText={(v) => setForm((s) => ({ ...s, fishingGround: v }))}
                placeholder="VD: Cửa Việt, Hoàng Sa..."
              />
              <DateTimeInput
                label="Thời gian bắt đầu"
                required
                value={form.startedAt}
                onChange={(d) => setForm((s) => ({ ...s, startedAt: d ?? s.startedAt }))}
              />
              <DateTimeInput
                label="Thời gian kết thúc"
                value={form.endedAt}
                onChange={(d) => setForm((s) => ({ ...s, endedAt: d ?? s.endedAt }))}
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
              <NumericInput
                label="Độ sâu (m)"
                allowDecimal
                minValue={0}
                value={form.depth}
                onChangeText={(v) => setForm((s) => ({ ...s, depth: v }))}
                placeholder="0"
              />
              <AppTextArea
                label="Ghi chú"
                value={form.notes}
                onChangeText={(v) => setForm((s) => ({ ...s, notes: v }))}
                placeholder="Ghi chú thêm (tuỳ chọn)"
                minHeight={80}
              />
            </FormSection>

            <FormSection
              title={`Sản lượng (${form.catches.length})`}
              description="Thêm các loài thuỷ sản và khối lượng ước tính cho mẻ này."
            >
              {form.catches.map((c, idx) => (
                <CatchItemForm
                  key={idx}
                  value={c}
                  onChange={(patch) => updateCatch(idx, patch)}
                  onRemove={() => removeCatch(idx)}
                />
              ))}
              <Button
                variant="secondary"
                onPress={addCatch}
                style={{ borderCurve: 'continuous' }}
              >
                <Text>+ Thêm loài</Text>
              </Button>
            </FormSection>

            <View className="mt-4 flex-row gap-2">
              <Button
                variant="secondary"
                size="lg"
                onPress={() => {
                  setCreating(false);
                  setForm(EMPTY_OP);
                }}
                disabled={submitting}
                accessibilityLabel="Huỷ"
                className="flex-1"
                style={{ borderCurve: 'continuous', minHeight: 48 }}
              >
                <Text>Huỷ</Text>
              </Button>
              <Button
                size="lg"
                onPress={handleSubmit}
                disabled={submitting}
                accessibilityLabel="Lưu hoạt động"
                className="flex-1"
                style={{ borderCurve: 'continuous', minHeight: 48 }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: palette.primaryForeground }}>
                  {submitting ? 'Đang lưu…' : 'Lưu hoạt động'}
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

// Local render of an operation card (reuses domain OperationCard externally).
function OperationCard({
  op,
  onDelete,
}: {
  op: FishingOperation;
  onDelete: () => void;
}) {
  return (
    <View className="rounded-lg border border-border bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">
          {OPERATION_TYPE_LABELS[op.operationType ?? ''] ?? op.operationType ?? 'Hoạt động'}
        </Text>
        <Pressable onPress={onDelete} hitSlop={10} className="px-2 py-1">
          <Text className="text-sm text-destructive">Xoá</Text>
        </Pressable>
      </View>
      <Text className="mt-1 text-sm text-muted-foreground">
        Bắt đầu: {fmt(op.operationStartedAt)}
        {op.operationEndedAt ? ` • Kết thúc: ${fmt(op.operationEndedAt)}` : ''}
      </Text>
      {op.fishingGround ? (
        <Text className="mt-0.5 text-sm text-muted-foreground">Ngư trường: {op.fishingGround}</Text>
      ) : null}
      {(op.catches?.length ?? 0) > 0 ? (
        <Text className="mt-1 text-sm text-foreground">
          Sản lượng: {op.catches?.length} loài
        </Text>
      ) : null}
    </View>
  );
}

const fmt = (iso?: string) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
};
