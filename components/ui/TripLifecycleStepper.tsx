/**
 * TripLifecycleStepper — visual lifecycle indicator.
 *
 * Surfaces the trip lifecycle PREPARING → DEPARTED → FISHING → RETURNING →
 * COMPLETED with completed/current/future step states.
 *
 * Single source of truth for "where is my trip" question — answers it in one
 * glance, regardless of screen.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import {
  TRIP_LIFECYCLE_ORDER,
  TRIP_STATUS_LABELS,
  isLifecycleStep,
  lifecycleStepIndex,
  type TripStatus,
} from '@/src/design-system/trip-status';
import { useColors } from '@/src/design-system/use-colors';

interface StepDescriptor {
  key: TripStatus;
  label: string;
  icon: string;
}

const STEPS: ReadonlyArray<StepDescriptor> = [
  { key: 'PREPARING', label: TRIP_STATUS_LABELS.PREPARING, icon: 'package-variant' },
  { key: 'DEPARTED', label: TRIP_STATUS_LABELS.DEPARTED, icon: 'anchor' },
  { key: 'FISHING', label: TRIP_STATUS_LABELS.FISHING, icon: 'fishbowl-outline' },
  { key: 'RETURNING', label: TRIP_STATUS_LABELS.RETURNING, icon: 'home-outline' },
  { key: 'COMPLETED', label: TRIP_STATUS_LABELS.COMPLETED, icon: 'check-circle' },
];

interface TripLifecycleStepperProps {
  status: TripStatus;
  className?: string;
}

function TripLifecycleStepperBase({ status, className }: TripLifecycleStepperProps) {
  const palette = useColors();
  const currentIndex = isLifecycleStep(status) ? lifecycleStepIndex(status) : -1;

  // For terminal/inactive states (DRAFT / CANCELLED) show the stepper with all
  // steps muted. The status pill above this widget already conveys the state.
  const isTerminal = status === 'COMPLETED' || status === 'CANCELLED';

  return (
    <View
      className={cn('rounded-2xl border border-border bg-surface p-3', className)}
      accessibilityRole="summary"
      accessibilityLabel={`Tiến độ chuyến biển: ${TRIP_STATUS_LABELS[status]}`}
    >
      <View className="flex-row items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentIndex > idx || status === 'COMPLETED';
          const isCurrent = currentIndex === idx;
          const isMuted = currentIndex < idx && !isTerminal;
          const isLast = idx === STEPS.length - 1;

          const dotColor = isCompleted
            ? palette.success
            : isCurrent
              ? palette.primary
              : palette.border;
          const labelColor = isCompleted
            ? 'text-success'
            : isCurrent
              ? 'text-primary'
              : isMuted
                ? 'text-textMuted'
                : 'text-textMuted';

          return (
            <React.Fragment key={step.key}>
              <View className="items-center" style={{ flex: 1 }}>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: isCompleted || isCurrent ? dotColor : palette.surface,
                    borderColor: dotColor,
                  }}
                >
                  <MaterialCommunityIcons
                    name={step.icon as any}
                    size={16}
                    color={
                      isCompleted || isCurrent
                        ? palette.textInverse
                        : palette.textMuted
                    }
                  />
                </View>
                <Text
                  variant="caption1"
                  className={cn('mt-1 text-center font-medium', labelColor)}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {!isLast ? (
                <View
                  className="-mt-4 h-0.5 flex-1"
                  style={{
                    backgroundColor:
                      currentIndex > idx ? palette.success : palette.border,
                    maxWidth: 24,
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export const TripLifecycleStepper = memo(TripLifecycleStepperBase);
export default TripLifecycleStepper;
