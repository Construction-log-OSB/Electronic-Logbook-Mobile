/**
 * TripNextActions — surfaces only the valid status transition(s) for the
 * current trip state. Pulls the next actions from the backend-provided
 * `TripWorkflow` (no client-side reinvention of the state machine).
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';

import { TRIP_NEXT_ACTIONS, type TripStatus } from '@/src/domain/types';
import type { TripWorkflow } from '@/src/api';

interface TripNextActionsProps {
  status: TripStatus;
  workflow: TripWorkflow;
  busyAction?: string | null;
  onAction: (action: string, label: string) => void;
}

interface ActionDescriptor {
  key: string;
  label: string;
  description: string;
}

const LABELS: Record<string, string> = {
  prepare: 'Chuẩn bị khởi hành',
  depart: 'Khởi hành',
  'start-fishing': 'Bắt đầu khai thác',
  'start-returning': 'Bắt đầu quay về',
  complete: 'Hoàn tất chuyến biển',
  cancel: 'Huỷ chuyến biển',
};

const DESCRIPTIONS: Record<string, string> = {
  prepare: 'Đã sẵn sàng tàu và thuyền viên cho chuyến biển.',
  depart: 'Ghi nhận thời điểm rời cảng.',
  'start-fishing': 'Ghi nhận bắt đầu các hoạt động khai thác.',
  'start-returning': 'Ghi nhận bắt đầu hành trình quay về cảng.',
  complete: 'Chuyến biển đã hoàn tất, các số liệu đã được ghi nhận đầy đủ.',
  cancel: 'Huỷ chuyến biển (chỉ khi chưa khởi hành).',
};

function actionsFor(
  status: TripStatus,
  workflow: TripWorkflow
): ActionDescriptor[] {
  // Source of truth: backend `TripWorkflow.canX` flags + the local
  // status-transition table for cancel handling.
  const next: ActionDescriptor[] = [];
  const allowed = (TRIP_NEXT_ACTIONS[status] ?? []).map((a) => a.key);

  for (const key of allowed) {
    if (key === 'depart' && workflow.canDepart === false) continue;
    if (key === 'start-fishing' && workflow.canStartFishing === false) continue;
    if (key === 'start-returning' && workflow.canReturn === false) continue;
    if (key === 'complete' && workflow.canComplete === false) continue;
    if (key === 'cancel' && (status === 'COMPLETED' || status === 'CANCELLED')) {
      continue;
    }
    next.push({
      key,
      label: LABELS[key] ?? key,
      description: DESCRIPTIONS[key] ?? '',
    });
  }
  return next;
}

export const TripNextActions = memo(function TripNextActions({
  status,
  workflow,
  busyAction,
  onAction,
}: TripNextActionsProps) {
  const actions = actionsFor(status, workflow);
  if (actions.length === 0) return null;

  return (
    <View className="mt-3 gap-2">
      {actions.map((a) => {
        const isBusy = busyAction === a.key;
        const isPrimary = a.key !== 'cancel';
        const isDanger = a.key === 'cancel';
        return (
          <View key={a.key}>
            <Button
              variant={isDanger ? 'secondary' : isPrimary ? 'primary' : 'secondary'}
              size="lg"
              onPress={() => onAction(a.key, a.label)}
              disabled={!!busyAction}
              className="w-full"
              style={{ borderCurve: 'continuous' }}
            >
              {isBusy ? (
                <ActivityIndicator color="rgb(var(--primary-foreground))" />
              ) : (
                <Text
                  className={`font-semibold ${isDanger ? 'text-destructive' : 'text-primary-foreground'}`}
                >
                  {a.label}
                </Text>
              )}
            </Button>
            {a.description ? (
              <Text variant="caption2" className="mt-1 text-muted-foreground">
                {a.description}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
});
