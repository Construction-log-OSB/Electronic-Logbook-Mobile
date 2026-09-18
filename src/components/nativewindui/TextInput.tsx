/**
 * TextInput — compound component following design-system patterns.
 *
 * Usage:
 * <TextInput>
 *   <TextInput.Label>Email</TextInput.Label>
 *   <TextInput.Input placeholder="Enter email" keyboardType="email-address" />
 *   <TextInput.Error>This field is required</TextInput.Error>
 * </TextInput>
 *
 * Password with toggle:
 * <TextInput>
 *   <TextInput.Label>Mật khẩu</TextInput.Label>
 *   <TextInput.PasswordInput />
 * </TextInput>
 */

import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import {
  Pressable,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';
import { COLORS } from '@/theme/colors';

cssInterop(RNTextInput, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

// ─── Types ────────────────────────────────────────────────────────────────

type InputVariant = 'default' | 'underlined';

export interface TextInputProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface LabelProps {
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'secondary';
}

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  className?: string;
  inputClassName?: string;
  variant?: InputVariant;
  error?: boolean;
  disabled?: boolean;
}

export interface ErrorProps {
  children?: React.ReactNode;
  className?: string;
}

// ─── Root ────────────────────────────────────────────────────────────────

function Root({ children, className, disabled }: TextInputProps) {
  return <View className={cn('w-full', disabled ? 'opacity-50' : '', className)}>{children}</View>;
}

// ─── Label ────────────────────────────────────────────────────────────────

function Label({ children, className, color = 'default' }: LabelProps) {
  const colorClass = color === 'secondary' ? 'text-secondary-foreground/90' : 'text-foreground';
  return (
    <Text className={cn('pb-1.5 text-[15px] font-medium leading-5', colorClass, className)}>
      {children}
    </Text>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────

function Input({
  children,
  className,
  inputClassName,
  variant = 'default',
  error,
  disabled,
  ...props
}: InputProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? COLORS.dark.grey6 : COLORS.light.grey6;
  const borderColor = error
    ? isDark
      ? COLORS.dark.destructive
      : COLORS.light.destructive
    : isDark
      ? COLORS.dark.grey5
      : COLORS.light.grey5;
  const textColor = isDark ? COLORS.dark.foreground : COLORS.light.foreground;
  const placeholderColor = isDark ? COLORS.dark.grey2 : COLORS.light.grey4;

  const baseClasses =
    variant === 'underlined' ? 'border-b rounded-none px-0 py-3' : 'rounded-xl px-4 py-3';

  return (
    <View
      className={cn('flex-row items-center', baseClasses, disabled ? 'opacity-50' : '', className)}
      style={{ backgroundColor, borderWidth: 1, borderColor }}>
      <RNTextInput
        className={cn('flex-1 text-[17px] leading-6', inputClassName)}
        style={{ color: textColor }}
        placeholderTextColor={placeholderColor}
        cursorColor={isDark ? COLORS.dark.primary : COLORS.light.primary}
        selectionColor={isDark ? COLORS.dark.primary : COLORS.light.primary}
        editable={!disabled}
        {...props}
      />
      {children}
    </View>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────

function Error({ children, className }: ErrorProps) {
  if (!children) return null;
  return (
    <View className={cn('flex-row items-center gap-1 pt-1.5', className)}>
      <View className="h-1 w-1 rounded-full bg-destructive" />
      <Text className="flex-1 text-[13px] leading-4 text-destructive">{children}</Text>
    </View>
  );
}

// ─── Password Input ───────────────────────────────────────────────────────

function PasswordInput({
  className,
  inputClassName,
  error,
  disabled,
  ...props
}: Omit<InputProps, 'secureTextEntry'>) {
  const [isVisible, setIsVisible] = React.useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? COLORS.dark.grey2 : COLORS.light.grey4;

  return (
    <Input
      className={className}
      inputClassName={inputClassName}
      error={error}
      disabled={disabled}
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}>
      <Pressable
        onPress={() => setIsVisible((prev) => !prev)}
        className="-mr-1 p-1"
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
        {isVisible ? (
          <MaterialCommunityIcons name="eye-off" size={20} color={iconColor} />
        ) : (
          <MaterialCommunityIcons name="eye" size={20} color={iconColor} />
        )}
      </Pressable>
    </Input>
  );
}

// ─── Compound exports ─────────────────────────────────────────────────────

export const TextInput = Object.assign(Root, {
  Label,
  Input,
  Error,
  PasswordInput,
});
