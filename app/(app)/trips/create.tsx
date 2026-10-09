/**
 * Create Trip Screen — minimal form to create a new fishing trip.
 *
 * Only asks for fields that are NOT auto-fillable from auth context, vessel,
 * or device time. Backend derives vesselName, registrationNumber, captain,
 * trip number, user, createdAt automatically.
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { FormSection, FormField } from '@/src/components/forms/primitives';
import { AppInput } from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { OfflineBanner } from '@/src/components/sync/banners';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { useColors } from '@/src/design-system/use-colors';

import { createTrip, getVessels, Vessel } from '@/src/api';

interface FormState {
  vesselId: string;
  departurePortCode: string;
  tripNumber: string;
  arrivalPortCode: string;
}

const EMPTY_FORM: FormState = {
  vesselId: '',
  departurePortCode: '',
  tripNumber: '',
  arrivalPortCode: '',
};

export default function CreateTripScreen() {
  const router = useRouter();
  const palette = useColors();

  const [vessels, setVessels] = React.useState<Vessel[]>([]);
  const [loadingVessels, setLoadingVessels] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getVessels({ limit: 50 });
        if (cancelled) return;
        setVessels(response);
      } catch {
        // tolerated — show inline message on submit
      } finally {
        if (!cancelled) setLoadingVessels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const vesselOptions = React.useMemo(
    () =>
      vessels.map((v) => ({
        label: `${v.vesselName || v.registrationNumber} (${v.registrationNumber})`,
        value: v.id,
        hint: v.status === 'ACTIVE' ? undefined : v.status,
      })),
    [vessels]
  );

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.vesselId) errs.vesselId = 'Vui lòng chọn tàu.';
    if (!form.departurePortCode.trim()) errs.departurePortCode = 'Vui lòng nhập cảng khởi hành.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    setError(null);
    if (!validate()) return;
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      const trip = await createTrip({
        vesselId: form.vesselId,
        tripNumber: form.tripNumber.trim() || undefined,
        departurePortCode: form.departurePortCode.trim() || undefined,
      });
      notify.success('Đã tạo chuyến biển');
      router.replace(`/trips/${trip.id}` as any);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!form.vesselId && !submitting && !loadingVessels;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Tạo chuyến biển" />
      <OfflineBanner />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 py-4 pb-8"
        >
          <FormSection
            title="Chuyến biển mới"
            description="Thông tin còn lại (tàu, số chuyến, ngày tạo) sẽ được hệ thống tự động điền."
          >
            <BottomSheetSelect
              label="Tàu"
              required
              error={fieldErrors.vesselId}
              value={form.vesselId || null}
              onChange={(v) => setForm((s) => ({ ...s, vesselId: String(v) }))}
              options={vesselOptions}
              placeholder={loadingVessels ? 'Đang tải…' : 'Chọn tàu của bạn'}
            />
            <AppInput
              label="Số chuyến biển"
              hint="Tùy chọn — nếu để trống, hệ thống tự tạo"
              value={form.tripNumber}
              onChangeText={(v) => setForm((s) => ({ ...s, tripNumber: v }))}
              placeholder="VD: CB-2026-01"
              autoCapitalize="characters"
            />
            <AppInput
              label="Cảng khởi hành"
              required
              error={fieldErrors.departurePortCode}
              value={form.departurePortCode}
              onChangeText={(v) => setForm((s) => ({ ...s, departurePortCode: v }))}
              placeholder="VD: Cảng Cái Răng"
            />
            <AppInput
              label="Cảng cập (nếu biết trước)"
              hint="Có thể bổ sung sau khi cập cảng"
              value={form.arrivalPortCode}
              onChangeText={(v) => setForm((s) => ({ ...s, arrivalPortCode: v }))}
              placeholder="VD: Cảng cá Rạch Giá"
            />
          </FormSection>

          {error ? (
            <View className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <Text variant="footnote" className="text-destructive">
                {error}
              </Text>
            </View>
          ) : null}

          {vessels.length === 0 && !loadingVessels ? (
            <View
              className="mb-3 rounded-lg border p-3"
              style={{
                borderColor: palette.warning,
                backgroundColor: palette.warningSurface,
              }}>
              <Text
                variant="footnote"
                style={{ color: palette.warning }}>
                Bạn chưa được thêm vào tàu nào. Vui lòng liên hệ quản trị viên trước khi tạo chuyến biển.
              </Text>
            </View>
          ) : null}

          <Button
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="mt-2 w-full"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="font-semibold text-primary-foreground">
              {submitting ? 'Đang tạo…' : 'Tạo chuyến biển'}
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
