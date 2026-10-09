/**
 * SegmentedControl — single-select segmented control.
 *
 * Replaces the raw Pressable row used in login.tsx for Email/Phone selection.
 * Each segment is at least 48pt high for accessibility.
 */

import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  className?: string;
}

function SegmentedControlBase<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      className={cn(
        'flex-row rounded-full bg-surfaceSecondary p-1',
        className
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: !!disabled }}
            className={cn(
              'flex-1 items-center justify-center rounded-full py-3 active:opacity-70',
              selected ? 'bg-surface' : 'bg-transparent'
            )}
            style={{ minHeight: 44 }}
          >
            <Text
              variant="subhead"
              className={
                selected ? 'font-semibold text-foreground' : 'text-textMuted'
              }
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentedControl = memo(SegmentedControlBase) as typeof SegmentedControlBase;
export default SegmentedControl;
