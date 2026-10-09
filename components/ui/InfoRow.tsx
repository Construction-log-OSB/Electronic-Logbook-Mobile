/**
 * InfoRow — single label / value pair used in detail screens.
 *
 * Replaces the file-local `InfoRow` previously defined in
 * `app/(app)/vessels/[id].tsx` and the `ProfileRow` from `(tabs)/profile.tsx`.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

interface InfoRowProps {
  label: string;
  value?: string | null;
  /** Optional MaterialCommunityIcons icon name to display in front of the label. */
  icon?: string;
  className?: string;
}

function InfoRowBase({ label, value, icon, className }: InfoRowProps) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      {icon ? (
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-surfaceSecondary">
          <MaterialCommunityIcons
            name={icon as any}
            size={16}
            className="text-textMuted"
          />
        </View>
      ) : null}
      <View className="flex-1 flex-row items-center justify-between">
        <Text variant="footnote" className="text-textMuted">
          {label}
        </Text>
        <Text
          variant="footnote"
          className="ml-3 max-w-[60%] text-right font-medium text-foreground"
          numberOfLines={2}
        >
          {value && value.length > 0 ? value : '—'}
        </Text>
      </View>
    </View>
  );
}

export const InfoRow = memo(InfoRowBase);
export default InfoRow;
