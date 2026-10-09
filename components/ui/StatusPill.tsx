/**
 * StatusPill — colored chip for trip status / incident severity / form status.
 *
 * Replaces the file-local `src/components/domain/status-pill.tsx`. Uses the
 * maritime palette tokens.
 */

import React, { memo } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import {
  tripStatusColor,
  tripStatusSurface,
  type TripStatus,
} from '@/src/design-system/trip-status';
import { useColors } from '@/src/design-system/use-colors';

interface StatusPillProps {
  status: TripStatus;
  /** Map trip status to arbitrary display label (defaults to status code). */
  label?: string;
  size?: 'sm' | 'md';
  /** Override classes for the outer pill container. */
  className?: string;
}

function StatusPillBase({ status, label, size = 'md', className }: StatusPillProps) {
  const palette = useColors();
  const color = tripStatusColor(status, palette);
  const surface = tripStatusSurface(status, palette);

  return (
    <View
      className={cn('self-start rounded-full', className)}
      style={{
        backgroundColor: surface,
        paddingHorizontal: size === 'sm' ? 8 : 10,
        paddingVertical: size === 'sm' ? 2 : 4,
      }}
    >
      <Text
        className={cn('font-semibold', size === 'sm' ? 'text-[11px]' : 'text-xs')}
        style={{ color }}
      >
        {label ?? status}
      </Text>
    </View>
  );
}

export const StatusPill = memo(StatusPillBase);
export default StatusPill;
