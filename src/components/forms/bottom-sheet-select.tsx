/**
 * BottomSheetSelect — ActionSheet-based select that follows platform UX.
 *
 * Uses @expo/react-native-action-sheet (already installed). The button is
 * memo'd; only the press action is recreated when options/handler change.
 */

import React, { memo } from 'react';
import { ActionSheetIOS, Platform, Pressable, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { cn } from '@/lib/cn';
import { RequiredLabel, ValidationMessage } from './primitives';

interface BottomSheetSelectProps<T extends string | number> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: T | null;
  onChange: (v: T) => void;
  options: Array<{ label: string; value: T; hint?: string }>;
  placeholder?: string;
  title?: string;
}

function BottomSheetSelectInner<T extends string | number>({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  options,
  placeholder,
  title,
}: BottomSheetSelectProps<T>) {
  const { showActionSheetWithOptions } = useActionSheet();

  const selected = options.find((o) => o.value === value);

  const open = () => {
    const labels = [...options.map((o) => o.label), 'Hủy'];
    const cancelIndex = labels.length - 1;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: title ?? label,
          options: labels,
          cancelButtonIndex: cancelIndex,
        },
        (idx) => {
          if (typeof idx === 'number' && idx < options.length) {
            onChange(options[idx].value);
          }
        }
      );
    } else {
      showActionSheetWithOptions(
        {
          title: title ?? label,
          options: labels,
          cancelButtonIndex: cancelIndex,
        },
        (idx) => {
          if (typeof idx === 'number' && idx < options.length) {
            onChange(options[idx].value);
          }
        }
      );
    }
  };

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <Pressable
        onPress={open}
        className={cn(
          'min-h-[44px] flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2',
          error ? 'border-destructive' : ''
        )}
      >
        <Text
          className={cn(
            'flex-1 text-base',
            selected ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {selected ? selected.label : placeholder ?? 'Chọn…'}
        </Text>
        <Text className="text-muted-foreground">▼</Text>
      </Pressable>
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
    </View>
  );
}

export const BottomSheetSelect = memo(BottomSheetSelectInner) as typeof BottomSheetSelectInner;
