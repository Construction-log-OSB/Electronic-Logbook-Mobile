/**
 * PrimaryButton / SecondaryButton / DangerButton — semantic button wrappers.
 *
 * Use these instead of raw `<Button>` with hardcoded variants + className
 * hacks. They ensure minimum 48pt height for primary actions, ensure text
 * contrast in both themes, and centralize the loading state.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

interface BaseButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Optional left-aligned icon. */
  icon?: React.ReactNode;
  /** Override className for the outer pressable. */
  className?: string;
  /** Render with smaller horizontal padding (used in dense headers). */
  compact?: boolean;
}

function PrimaryButtonBase({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  className,
  compact = false,
}: BaseButtonProps) {
  return (
    <Button
      variant="primary"
      size={compact ? 'md' : 'lg'}
      onPress={onPress}
      disabled={disabled || loading}
      className={cn('w-full', className)}
      style={{ borderCurve: 'continuous' }}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="rgb(var(--primary-foreground))" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="font-semibold text-primary-foreground">{title}</Text>
        </View>
      )}
    </Button>
  );
}

function SecondaryButtonBase({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  className,
  compact = false,
}: BaseButtonProps) {
  return (
    <Button
      variant="secondary"
      size={compact ? 'md' : 'lg'}
      onPress={onPress}
      disabled={disabled || loading}
      className={cn('w-full', className)}
      style={{ borderCurve: 'continuous' }}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="font-medium text-foreground">{title}</Text>
        </View>
      )}
    </Button>
  );
}

function DangerButtonBase({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  className,
  compact = false,
}: BaseButtonProps) {
  return (
    <Button
      variant="primary"
      size={compact ? 'md' : 'lg'}
      onPress={onPress}
      disabled={disabled || loading}
      className={cn('w-full', className)}
      style={{ borderCurve: 'continuous', backgroundColor: 'rgb(var(--danger))' }}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="rgb(var(--primary-foreground))" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="font-semibold text-primary-foreground">{title}</Text>
        </View>
      )}
    </Button>
  );
}

export const PrimaryButton = memo(PrimaryButtonBase);
export const SecondaryButton = memo(SecondaryButtonBase);
export const DangerButton = memo(DangerButtonBase);
export default PrimaryButton;
