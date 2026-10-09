/**
 * Trip Crew Management — captain + crew members for a single fishing trip.
 *
 * Backend enforces crew exclusivity — if a crew member is already on another
 * active trip the API will return a 409 Conflict, which we surface as a
 * Vietnamese friendly message.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/ErrorState';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { useColors } from '@/src/design-system/use-colors';
import { CrewMemberCard } from '@/src/components/domain/cards';
import { AppInput } from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';

import {
  getTripOverview,
  TripCrewMember,
} from '@/src/api';

export default function TripCrewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [crew, setCrew] = React.useState<TripCrewMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [adding, setAdding] = React.useState(false);
  const [fishermanCode, setFishermanCode] = React.useState('');
  const [crewRole, setCrewRole] = React.useState<'CAPTAIN' | 'CREW' | 'OBSERVER'>('CREW');
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);

  async function fetchCrew() {
    if (!id) return;
    try {
      setError(null);
      // Use overview as authoritative because it returns captain + crew joined.
      const overview = await getTripOverview(id);
      setCrew(overview.crew);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    void fetchCrew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchCrew();
  }, [id]);

  async function handleAdd() {
    if (!id) return;
    if (!fishermanCode.trim()) {
      setFieldError('Vui lòng nhập mã thuyền viên.');
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    try {
      const result = await offlineWrite<TripCrewMember>({
        endpoint: '/electronic-logbook/fishing-trip-crew',
        method: 'POST',
        payload: {
          fishingTripId: id,
          fishermanCode: fishermanCode.trim(),
          crewRole,
        },
        entityType: 'fishing-trip-crew',
        localState: {
          fishingTripId: id,
          fishermanCode: fishermanCode.trim(),
          crewRole,
        },
      });
      if (result.kind === 'ok') {
        notify.success('Đã thêm thuyền viên');
        setFishermanCode('');
        setAdding(false);
        await fetchCrew();
      } else if (result.kind === 'queued') {
        notify.queued();
        setFishermanCode('');
        setAdding(false);
        await fetchCrew();
      } else {
        notify.error(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleRemove(member: TripCrewMember) {
    Alert.alert(
      'Xoá thuyền viên?',
      `${member.fullName ?? member.fishermanCode ?? 'Thuyền viên này'} sẽ bị xoá khỏi chuyến biển.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            const result = await offlineWrite<void>({
              endpoint: `/electronic-logbook/fishing-trip-crew/${member.id}`,
              method: 'DELETE',
              entityType: 'fishing-trip-crew',
              entityId: member.id,
            });
            if (result.kind === 'ok') {
              notify.success('Đã xoá thuyền viên');
              await fetchCrew();
            } else if (result.kind === 'queued') {
              notify.queued();
              await fetchCrew();
            } else {
              notify.error(result.message);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Thuyền viên" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error && crew.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Thuyền viên" />
        <ErrorState
          title="Không thể tải danh sách thuyền viên"
          message={error}
          onRetry={fetchCrew}
        />
      </SafeAreaView>
    );
  }

  const captain = crew.find((c) => c.crewRole === 'CAPTAIN');
  const others = crew.filter((c) => c.crewRole !== 'CAPTAIN');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Thuyền viên" />
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
        {captain ? (
          <Section title="Thuyền trưởng">
            <CrewMemberCard
              member={captain}
              onRemove={() => handleRemove(captain)}
            />
          </Section>
        ) : null}

        <Section title={`Thuyền viên (${others.length})`}>
          {others.length === 0 ? (
            <InlineEmpty icon="account-multiple-outline" message="Chưa có thuyền viên nào được thêm." />
          ) : (
            others.map((m) => (
              <CrewMemberCard
                key={m.id}
                member={m}
                onRemove={() => handleRemove(m)}
              />
            ))
          )}
        </Section>

        <View className="mt-6">
          {!adding ? (
            <Button
              size="lg"
              onPress={() => setAdding(true)}
              accessibilityLabel="Thêm thuyền viên"
              className="w-full"
              style={{ borderCurve: 'continuous', minHeight: 48 }}>
              <Text
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                + Thêm thuyền viên
              </Text>
            </Button>
          ) : (
            <View className="rounded-xl border border-border bg-card p-3">
              <AppInput
                label="Mã thuyền viên"
                required
                error={fieldError ?? undefined}
                value={fishermanCode}
                onChangeText={setFishermanCode}
                placeholder="VD: CB-0001"
                autoCapitalize="characters"
              />
              <View className="mt-2">
                <BottomSheetSelect
                  label="Vai trò"
                  required
                  value={crewRole}
                  onChange={(v) => setCrewRole(v as typeof crewRole)}
                  options={[
                    { label: 'Thuyền viên', value: 'CREW' },
                    { label: 'Thuyền trưởng', value: 'CAPTAIN' },
                    { label: 'Quan sát viên', value: 'OBSERVER' },
                  ]}
                />
              </View>
              <View className="mt-3 flex-row gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setAdding(false);
                    setFishermanCode('');
                    setFieldError(null);
                  }}
                  disabled={submitting}
                  accessibilityLabel="Huỷ"
                  className="flex-1"
                  style={{ borderCurve: 'continuous', minHeight: 44 }}>
                  <Text>Huỷ</Text>
                </Button>
                <Button
                  size="md"
                  onPress={handleAdd}
                  disabled={submitting}
                  accessibilityLabel="Lưu"
                  className="flex-1"
                  style={{ borderCurve: 'continuous', minHeight: 44 }}>
                  <Text
                    className="font-semibold"
                    style={{ color: palette.primaryForeground }}>
                    {submitting ? 'Đang lưu…' : 'Lưu'}
                  </Text>
                </Button>
              </View>
            </View>
          )}
        </View>
      </RefreshableScroll>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text variant="heading" className="mb-2 font-semibold">
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}
