/**
 * Domain cards — presentational only.
 *
 * Migrated to the maritime palette tokens. Hardcoded hex constants removed.
 */

import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import {
  OPERATION_TYPE_LABELS,
  PORT_CALL_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  INCIDENT_TYPE_LABELS,
  VESSEL_STATUS_LABELS,
  CREW_ROLE_LABELS,
  FORM_CODE_LABELS,
} from '@/src/domain/types';
import {
  incidentSeverityColor,
  incidentSeveritySurface,
  type IncidentSeverity,
} from '@/src/design-system/incident';
import {
  formStatusColor,
  formStatusSurface,
  FORM_STATUS_LABELS,
  type FormStatus,
} from '@/src/design-system/form-status';
import { describeFormAction } from '@/src/design-system/form-action';
import {
  tripStatusColor,
  tripStatusSurface,
  TRIP_STATUS_LABELS,
  type TripStatus,
} from '@/src/design-system/trip-status';
import { useColors } from '@/src/design-system/use-colors';

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso ?? '—';
  }
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return iso ?? '—';
  }
};

// ─── TripCard ─────────────────────────────────────────────────────────────

interface TripCardProps {
  trip: {
    id: string;
    tripNumber?: string;
    vesselName?: string;
    vesselRegistrationNumber?: string;
    departureAt?: string;
    arrivalAt?: string;
    status: TripStatus;
  };
  onPress?: () => void;
}

export const TripCard = memo(function TripCard({ trip, onPress }: TripCardProps) {
  const palette = useColors();
  const statusColor = tripStatusColor(trip.status, palette);
  const statusSurface = tripStatusSurface(trip.status, palette);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chuyến biển ${trip.tripNumber ?? trip.id.slice(0, 8)}, trạng thái ${TRIP_STATUS_LABELS[trip.status] ?? trip.status}`}
      className="mx-3 mb-3 rounded-2xl border border-border bg-surface p-4 active:opacity-70"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          Chuyến biển #{trip.tripNumber ?? trip.id.slice(0, 8)}
        </Text>
        <View
          className="rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: statusSurface }}
        >
          <Text className="text-xs font-semibold" style={{ color: statusColor }}>
            {TRIP_STATUS_LABELS[trip.status] ?? trip.status}
          </Text>
        </View>
      </View>
      <Text className="mt-1 text-sm text-textMuted" numberOfLines={1}>
        Tàu: {trip.vesselName ?? '—'}{trip.vesselRegistrationNumber ? ` (${trip.vesselRegistrationNumber})` : ''}
      </Text>
      <View className="mt-2 flex-row gap-4">
        <Text className="text-xs text-textMuted">
          Khởi hành: <Text className="text-foreground">{formatDateTime(trip.departureAt)}</Text>
        </Text>
        <Text className="text-xs text-textMuted">
          Về: <Text className="text-foreground">{formatDateTime(trip.arrivalAt)}</Text>
        </Text>
      </View>
    </Pressable>
  );
});

// ─── VesselCard ──────────────────────────────────────────────────────────

interface VesselCardProps {
  vessel: {
    id: string;
    vesselName: string;
    registrationNumber: string;
    vesselType?: string;
    length?: number;
    status: keyof typeof VESSEL_STATUS_LABELS | string;
  };
  onPress?: () => void;
}

export const VesselCard = memo(function VesselCard({ vessel, onPress }: VesselCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Tàu ${vessel.vesselName || vessel.registrationNumber}`}
      className="mx-3 mb-3 rounded-2xl border border-border bg-surface p-4 active:opacity-70"
      style={{ borderCurve: 'continuous' }}
    >
      <Text className="text-base font-semibold text-foreground">
        {vessel.vesselName || vessel.registrationNumber}
      </Text>
      <Text className="mt-0.5 text-sm text-textMuted">
        Số đăng ký: {vessel.registrationNumber}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
        {vessel.vesselType ? (
          <Text className="text-xs text-textMuted">Loại: {vessel.vesselType}</Text>
        ) : null}
        {vessel.length ? (
          <Text className="text-xs text-textMuted">Chiều dài: {vessel.length} m</Text>
        ) : null}
        <Text className="text-xs text-textMuted">
          Trạng thái: {VESSEL_STATUS_LABELS[vessel.status as keyof typeof VESSEL_STATUS_LABELS] ?? vessel.status}
        </Text>
      </View>
    </Pressable>
  );
});

// ─── CrewMemberCard ──────────────────────────────────────────────────────

interface CrewMemberCardProps {
  member: {
    id: string;
    userId: string;
    fishermanCode?: string;
    fullName?: string;
    crewRole: string;
    joinedAt?: string;
  };
  onRemove?: () => void;
}

export const CrewMemberCard = memo(function CrewMemberCard({ member, onRemove }: CrewMemberCardProps) {
  const role = CREW_ROLE_LABELS[member.crewRole] ?? member.crewRole;
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-foreground">
          {member.fullName ?? member.fishermanCode ?? '—'}
        </Text>
        <Text className="mt-0.5 text-xs text-textMuted">
          {role}
          {member.fishermanCode ? ` · ${member.fishermanCode}` : ''}
        </Text>
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Xoá ${member.fullName ?? member.fishermanCode}`}
          hitSlop={8}
          className="min-h-[44px] items-center justify-center px-3 active:opacity-70"
        >
          <Text className="text-sm font-medium text-danger">Xoá</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

// ─── OperationCard ───────────────────────────────────────────────────────

interface OperationCardProps {
  op: {
    id: string;
    operationStartedAt?: string;
    operationEndedAt?: string;
    operationType?: string;
    fishingGearType?: string;
    fishingGround?: string;
    catches?: { id: string; speciesName?: string; quantity?: number; unit?: string }[];
  };
  onDelete?: () => void;
}

export const OperationCard = memo(function OperationCard({ op, onDelete }: OperationCardProps) {
  const opLabel = OPERATION_TYPE_LABELS[op.operationType ?? ''] ?? op.operationType ?? 'Hoạt động';
  const total = (op.catches ?? []).reduce(
    (sum, c) => sum + (c.quantity ?? 0),
    0
  );
  return (
    <View className="rounded-2xl border border-border bg-surface p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">{opLabel}</Text>
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            className="min-h-[44px] items-center justify-center px-3 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Xoá hoạt động"
          >
            <Text className="text-sm text-danger">Xoá</Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="mt-1 text-sm text-textMuted">
        Bắt đầu: {formatDateTime(op.operationStartedAt)}
        {op.operationEndedAt ? ` · Kết thúc: ${formatDateTime(op.operationEndedAt)}` : ''}
      </Text>
      {op.fishingGround ? (
        <Text className="mt-1 text-sm text-textMuted">Ngư trường: {op.fishingGround}</Text>
      ) : null}
      {op.fishingGearType ? (
        <Text className="mt-0.5 text-sm text-textMuted">Ngư cụ: {op.fishingGearType}</Text>
      ) : null}
      {(op.catches?.length ?? 0) > 0 ? (
        <View className="mt-2 rounded-md bg-surfaceSecondary px-3 py-2">
          <Text className="text-sm font-medium text-foreground">
            Sản lượng: {total.toLocaleString('vi-VN')} kg
          </Text>
          {(op.catches ?? []).map((c) => (
            <Text key={c.id} className="mt-1 text-xs text-textMuted">
              • {c.speciesName ?? 'Loài'} — {(c.quantity ?? 0).toLocaleString('vi-VN')} {c.unit ?? 'kg'}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
});

// ─── FuelRecordCard ──────────────────────────────────────────────────────

interface FuelRecordCardProps {
  fuel: {
    id: string;
    recordType?: string;
    quantity?: number;
    unit?: string;
    occurredAt?: string;
    location?: string;
  };
}

export const FuelRecordCard = memo(function FuelRecordCard({ fuel }: FuelRecordCardProps) {
  const label = FUEL_TYPE_LABELS[fuel.recordType ?? ''] ?? fuel.recordType ?? 'Nhiên liệu';
  return (
    <View className="rounded-2xl border border-border bg-surface p-3">
      <Text className="text-base font-semibold text-foreground">{label}</Text>
      <Text className="mt-1 text-sm text-textMuted">
        {formatDateTime(fuel.occurredAt)}
        {fuel.quantity !== undefined && fuel.quantity !== null
          ? ` · ${fuel.quantity.toLocaleString('vi-VN')} ${fuel.unit ?? 'lít'}`
          : ''}
      </Text>
      {fuel.location ? (
        <Text className="mt-0.5 text-sm text-textMuted">Tại: {fuel.location}</Text>
      ) : null}
    </View>
  );
});

// ─── IncidentCard ────────────────────────────────────────────────────────

interface IncidentCardProps {
  incident: {
    id: string;
    incidentType?: string;
    severity?: string;
    occurredAt?: string;
    description?: string;
  };
}

export const IncidentCard = memo(function IncidentCard({ incident }: IncidentCardProps) {
  const palette = useColors();
  const sev = (incident.severity ?? '') as IncidentSeverity | '';
  const color = sev ? incidentSeverityColor(sev as IncidentSeverity, palette) : palette.textMuted;
  const surface = sev ? incidentSeveritySurface(sev as IncidentSeverity, palette) : palette.surfaceSecondary;
  const typeLabel =
    INCIDENT_TYPE_LABELS[incident.incidentType ?? ''] ?? incident.incidentType ?? 'Sự cố';
  const sevLabel = sev
    ? ({ LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', CRITICAL: 'Nghiêm trọng' } as Record<IncidentSeverity, string>)[sev as IncidentSeverity]
    : '';
  return (
    <View className="rounded-2xl border border-border bg-surface p-3">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-foreground">{typeLabel}</Text>
        {sevLabel ? (
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: surface }}
          >
            <Text className="text-xs font-semibold" style={{ color }}>
              {sevLabel}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-1 text-sm text-textMuted">{formatDateTime(incident.occurredAt)}</Text>
      {incident.description ? (
        <Text className="mt-1 text-sm text-foreground">{incident.description}</Text>
      ) : null}
    </View>
  );
});

// ─── PortCallRow ─────────────────────────────────────────────────────────

interface PortCallRowProps {
  portCall: {
    id: string;
    callType?: string;
    portCode?: string;
    occurredAt?: string;
    reason?: string;
  };
}

export const PortCallRow = memo(function PortCallRow({ portCall }: PortCallRowProps) {
  const label = PORT_CALL_TYPE_LABELS[portCall.callType ?? ''] ?? portCall.callType ?? 'Cập cảng';
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-foreground">{label}</Text>
        <Text className="mt-0.5 text-xs text-textMuted">
          {portCall.portCode ?? '—'} · {formatDateTime(portCall.occurredAt)}
        </Text>
      </View>
    </View>
  );
});

// ─── FormStatusRow (M01/M02/M03) ──────────────────────────────────────────

interface FormStatusRowProps {
  code: 'M01' | 'M02' | 'M03';
  form?: { id: string; status: string; submittedAt?: string };
  onPress?: () => void;
}

export const FormStatusRow = memo(function FormStatusRow({ code, form, onPress }: FormStatusRowProps) {
  const palette = useColors();
  const label = FORM_CODE_LABELS[code];
  const status = (form?.status ?? 'NOT_STARTED') as FormStatus;
  const statusText = FORM_STATUS_LABELS[status] ?? status;
  const color = formStatusColor(status, palette);
  const surface = formStatusSurface(status, palette);
  const action = describeFormAction(status);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Biểu mẫu ${code}: ${statusText}. ${action.label}.`}
      accessibilityHint={action.hint}
      className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3 active:opacity-70"
      style={{ minHeight: 64 }}
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: surface }}
          >
            <Text className="text-xs font-semibold" style={{ color }}>
              {statusText}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            {code}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Text
          className="text-sm font-medium"
          style={{ color: palette.primary }}
        >
          {action.label}
        </Text>
        <Text style={{ color: palette.textMuted }}>›</Text>
      </View>
    </Pressable>
  );
});

// ─── DocumentCard ────────────────────────────────────────────────────────

interface DocumentCardProps {
  doc: {
    id: string;
    originalFileName: string;
    mimeType: string;
    fileSize?: number;
    uploadedAt: string;
  };
  onDelete?: () => void;
}

export const DocumentCard = memo(function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {doc.originalFileName}
        </Text>
        <Text className="mt-0.5 text-xs text-textMuted">
          {doc.mimeType}
          {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
          {' · '}
          {formatDate(doc.uploadedAt)}
        </Text>
      </View>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="min-h-[44px] items-center justify-center px-3 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={`Xoá ${doc.originalFileName}`}
        >
          <Text className="text-sm font-medium text-danger">Xoá</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

void cn;
