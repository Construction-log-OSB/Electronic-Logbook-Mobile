/**
 * Trip Workspace — the central screen for a single fishing trip.
 *
 * Surfaces:
 *  - Trip header (vessel name, reg number, status, departure/return)
 *  - Status-driven primary action (Prepare / Depart / Start Fishing / Return / Complete)
 *  - Crew summary + link to crew detail
 *  - Operations summary + link to operations
 *  - Catch summary
 *  - Fuel summary
 *  - Incidents summary
 *  - Landing summary
 *  - Forms (M01 / M02 / M03)
 *  - Documents
 *
 * Powered by ONE aggregated endpoint: `GET /electronic-logbook/fishing-trips/:id/overview`.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { SyncStatusPill, OfflineBanner } from '@/src/components/sync/banners';
import {
  TripCard,
  CrewMemberCard,
  OperationCard,
  FuelRecordCard,
  IncidentCard,
  PortCallRow,
  FormStatusRow,
  DocumentCard,
} from '@/src/components/domain/cards';
import { StatusPill } from '@/src/components/domain/status-pill';
import { TripNextActions } from '@/src/components/domain/trip-next-actions';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';
import { offlineWrite } from '@/src/offline/offline-write';
import { useSyncStore } from '@/src/offline/sync-store';

import {
  getTripOverview,
  TripOverview,
  TripCrewMember,
} from '@/src/api';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const refreshSyncCounts = useSyncStore((s) => s.refreshCounts);

  const [overview, setOverview] = React.useState<TripOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [transitioning, setTransitioning] = React.useState<string | null>(null);

  async function fetchOverview() {
    if (!id) return;
    try {
      setError(null);
      const data = await getTripOverview(id);
      setOverview(data);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    await fetchOverview();
  }, [id]);

  async function handleTransition(action: string, label: string) {
    if (!id) return;
    Alert.alert(
      label,
      'Xác nhận thực hiện thao tác này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setTransitioning(action);
            const result = await offlineWrite({
              endpoint: `/electronic-logbook/fishing-trips/${id}/${action}`,
              method: 'POST',
              entityType: 'fishing-trip',
              entityId: id,
            });
            setTransitioning(null);
            if (result.kind === 'ok') {
              notify.success('Đã cập nhật trạng thái chuyến biển');
              void fetchOverview();
              void refreshSyncCounts();
            } else if (result.kind === 'queued') {
              notify.queued();
              void fetchOverview();
              void refreshSyncCounts();
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
        <ScreenHeader title="Chuyến biển" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !overview) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Chuyến biển" />
        <ErrorState
          title="Không thể tải chuyến biển"
          message={error}
          onRetry={fetchOverview}
        />
      </SafeAreaView>
    );
  }

  if (!overview) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Chuyến biển" />
        <EmptyState
          icon="anchor"
          title="Không tìm thấy chuyến biển"
          description="Chuyến biển này có thể đã bị xoá hoặc bạn không có quyền truy cập."
          actionLabel="Quay lại"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const trip = overview.trip;
  const vessel = overview.vessel ?? trip.vessel;
  const captain = overview.captain;
  const otherCrew = overview.crew.filter(
    (m: TripCrewMember) => m.id !== captain?.id
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader
        title={trip.tripNumber ?? 'Chuyến biển'}
        subtitle={vessel?.vesselName}
        right={<SyncStatusPill />}
      />
      <OfflineBanner />
      <RefreshableScroll
        onRefresh={handleRefresh}
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Trip header */}
        <View className="px-4 pt-3">
          <TripCard trip={trip} />
          <View className="mt-3 flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
            <View className="flex-1 pr-3">
              <Text variant="footnote" className="text-muted-foreground">
                Trạng thái
              </Text>
              <View className="mt-1">
                <StatusPill status={trip.status} />
              </View>
            </View>
            <View className="flex-1">
              <Text variant="footnote" className="text-muted-foreground">
                Khởi hành
              </Text>
              <Text variant="subhead" className="font-medium">
                {fmtDate(trip.departureAt)}
              </Text>
            </View>
          </View>

          {/* Primary action(s) */}
          <TripNextActions
            status={trip.status}
            workflow={overview.workflow}
            busyAction={transitioning}
            onAction={handleTransition}
          />
        </View>

        {/* Sections */}
        <Section
          title="Thuyền trưởng & thuyền viên"
          count={(captain ? 1 : 0) + otherCrew.length}
          actionLabel="Quản lý"
          onAction={() => router.push(`/trips/${id}/crew` as any)}
        >
          {captain ? (
            <View className="mb-2">
              <CrewMemberCard member={captain} />
            </View>
          ) : (
            <Text variant="footnote" className="mb-2 text-muted-foreground">
              Chưa có thuyền trưởng.
            </Text>
          )}
          {otherCrew.slice(0, 3).map((m) => (
            <CrewMemberCard key={m.id} member={m} />
          ))}
          {otherCrew.length > 3 ? (
            <Text variant="caption2" className="mt-2 text-muted-foreground">
              +{otherCrew.length - 3} thuyền viên khác
            </Text>
          ) : null}
        </Section>

        <Section
          title="Hoạt động khai thác"
          count={overview.operations.length}
          actionLabel="Ghi hoạt động"
          onAction={() => router.push(`/trips/${id}/operation` as any)}
        >
          {overview.operations.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có hoạt động khai thác nào được ghi.
            </Text>
          ) : (
            overview.operations.slice(0, 3).map((op) => (
              <OperationCard key={op.id} op={op} />
            ))
          )}
        </Section>

        <Section
          title="Sản lượng"
          summary={
            overview.catchSummary.totalWeight > 0
              ? `${overview.catchSummary.totalWeight.toLocaleString('vi-VN')} kg · ${overview.catchSummary.speciesCount} loài`
              : undefined
          }
          actionLabel="Ghi sản lượng"
          onAction={() => router.push(`/trips/${id}/catch` as any)}
        >
          {overview.catchBySpecies.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có sản lượng nào được ghi.
            </Text>
          ) : (
            overview.catchBySpecies.slice(0, 4).map((c) => (
              <View
                key={c.speciesCode}
                className="flex-row items-center justify-between rounded-md border border-border bg-card px-3 py-2"
              >
                <Text variant="subhead" className="font-medium">
                  {c.speciesName ?? c.speciesCode}
                </Text>
                <Text variant="subhead" className="text-muted-foreground">
                  {c.totalQuantity.toLocaleString('vi-VN')} {c.unit}
                </Text>
              </View>
            ))
          )}
        </Section>

        <Section
          title="Nhiên liệu"
          count={overview.fuelRecords.length}
          actionLabel="Ghi nhiên liệu"
          onAction={() => router.push(`/trips/${id}/fuel` as any)}
        >
          {overview.fuelRecords.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có bản ghi nhiên liệu.
            </Text>
          ) : (
              overview.fuelRecords.slice(0, 3).map((f) => (
                <FuelRecordCard key={f.id} fuel={f} />
              ))
          )}
        </Section>

        <Section
          title="Sự cố"
          count={overview.incidents.length}
          actionLabel="Báo sự cố"
          onAction={() => router.push(`/trips/${id}/incident` as any)}
        >
          {overview.incidents.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có sự cố nào.
            </Text>
          ) : (
            overview.incidents.slice(0, 3).map((inc) => (
              <IncidentCard key={inc.id} incident={inc} />
            ))
          )}
        </Section>

        <Section
          title="Cập cảng"
          count={overview.portCalls.length}
          actionLabel="Ghi cập cảng"
          onAction={() => router.push(`/trips/${id}/port-call` as any)}
        >
          {overview.portCalls.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có cập cảng.
            </Text>
          ) : (
            overview.portCalls.slice(0, 3).map((p) => (
              <PortCallRow key={p.id} portCall={p} />
            ))
          )}
        </Section>

        <Section title="Biểu mẫu bắt buộc">
          <FormStatusRow
            code="M01"
            form={overview.forms.m01}
            onPress={() => router.push(`/trips/${id}/forms/M01` as any)}
          />
          <FormStatusRow
            code="M02"
            form={overview.forms.m02}
            onPress={() => router.push(`/trips/${id}/forms/M02` as any)}
          />
          <FormStatusRow
            code="M03"
            form={overview.forms.m03}
            onPress={() => router.push(`/trips/${id}/forms/M03` as any)}
          />
        </Section>

        <Section
          title="Tài liệu"
          count={overview.documents.length}
          actionLabel="Tải lên"
          onAction={() => router.push(`/trips/${id}/documents` as any)}
        >
          {overview.documents.length === 0 ? (
            <Text variant="footnote" className="text-muted-foreground">
              Chưa có tài liệu nào.
            </Text>
          ) : (
              overview.documents.slice(0, 3).map((d) => (
                <DocumentCard key={d.id} doc={d} />
              ))
          )}
        </Section>
      </RefreshableScroll>
    </SafeAreaView>
  );
}

interface SectionProps {
  title: string;
  count?: number;
  summary?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

function Section({
  title,
  count,
  summary,
  actionLabel,
  onAction,
  children,
}: SectionProps) {
  return (
    <View className="mt-6 px-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="heading" className="font-semibold">
            {title}
            {typeof count === 'number' && count > 0 ? (
              <Text variant="heading" className="text-muted-foreground">
                {' '}
                ({count})
              </Text>
            ) : null}
          </Text>
          {summary ? (
            <Text variant="caption1" className="text-muted-foreground">
              {summary}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Button
            variant="tonal"
            size="sm"
            onPress={onAction}
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="text-primary">{actionLabel}</Text>
          </Button>
        ) : null}
      </View>
      <View className="gap-2">{children}</View>
    </View>
  );
}
