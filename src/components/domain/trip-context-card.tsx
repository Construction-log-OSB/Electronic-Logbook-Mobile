/**
 * TripContextCard — read-only trip/vessel/crew summary rendered at the
 * top of every form screen (M01 / M02 / M03) so the user never has to
 * re-enter information the system already knows.
 *
 * The card surfaces only fields that are guaranteed to be on a trip. Optional
 * sections collapse when their data is missing.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import type { TripOverview } from '@/src/api';

interface TripContextCardProps {
  overview: TripOverview;
  /**
   * Optional set of form codes (M01/M02/M03) whose specific notes should be
   * highlighted at the top — used to show guidance ("M03: gửi trước khi rời cảng").
   */
  emphasisCode?: 'M01' | 'M02' | 'M03';
}

function fmtDate(iso?: string | null): string {
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
}

export const TripContextCard = memo(function TripContextCard({
  overview,
  emphasisCode,
}: TripContextCardProps) {
  const trip = overview.trip;
  const vessel = overview.vessel ?? trip.vessel ?? undefined;
  const captain = overview.captain;
  const crewCount = overview.crew?.length ?? 0;

  return (
    <View
      className="mb-4 rounded-2xl border border-border bg-surface p-4"
      accessibilityRole="summary"
    >
      <Text variant="footnote" className="text-muted-foreground">
        Thông tin chuyến biển
      </Text>
      <Text variant="title3" className="mt-1 font-semibold">
        {trip.tripNumber ?? `Chuyến #${trip.id.slice(0, 8)}`}
      </Text>

      {vessel ? (
        <View className="mt-3 gap-1">
          <Row label="Tàu" value={vessel.vesselName ?? '—'} />
          <Row
            label="Số đăng ký"
            value={vessel.registrationNumber ?? '—'}
          />
        </View>
      ) : null}

      <View className="mt-3 gap-1">
        <Row label="Khởi hành" value={fmtDate(trip.departureAt)} />
        {trip.arrivalAt ? (
          <Row label="Cập cảng" value={fmtDate(trip.arrivalAt)} />
        ) : null}
        {trip.departurePortCode ? (
          <Row label="Cảng đi" value={trip.departurePortCode} />
        ) : null}
        {trip.arrivalPortCode ? (
          <Row label="Cảng đến" value={trip.arrivalPortCode} />
        ) : null}
      </View>

      {(captain || crewCount > 0) ? (
        <View className="mt-3 gap-1">
          {captain ? (
            <Row label="Thuyền trưởng" value={captain.userId?.slice(0, 8) ?? 'Đã gán'} />
          ) : (
            <Row label="Thuyền trưởng" value="Chưa gán" muted />
          )}
          <Row
            label="Thuyền viên"
            value={`${crewCount} người`}
          />
        </View>
      ) : null}

      {emphasisCode ? <EmphasisNote code={emphasisCode} /> : null}
    </View>
  );
});

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="footnote" className="text-muted-foreground">
        {label}
      </Text>
      <Text
        variant="footnote"
        className={muted ? 'text-muted-foreground italic' : 'font-medium text-foreground'}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function EmphasisNote({ code }: { code: 'M01' | 'M02' | 'M03' }) {
  const note: Record<typeof code, string> = {
    M03: 'M03: gửi TRƯỚC khi rời cảng — khai báo tàu, thuyền viên, thiết bị.',
    M01: 'M01: gửi KHI cập cảng — biên nhận bốc dỡ sản phẩm khai thác.',
    M02: 'M02: gửi SAU khi cập cảng — biên bản kiểm tra cập cảng.',
  } as const;
  return (
    <View className="mt-3 rounded-lg border border-info/30 bg-info/5 p-2">
      <Text variant="caption2" className="text-info">
        {note[code]}
      </Text>
    </View>
  );
}