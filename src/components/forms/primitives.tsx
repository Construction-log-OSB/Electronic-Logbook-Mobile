/**
 * Reusable form primitives — strictly typed, prevent layout remount on
 * keystroke (the cause of the admin input-focus bug).
 *
 * All components are exported as React.memo'd named exports so the parent
 * can pass new objects/handlers without forcing a remount on every render.
 */

import React, { memo, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { cn } from '@/lib/cn';

// ─── FormSection ─────────────────────────────────────────────────────────

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const FormSection = memo(function FormSection({
  title,
  description,
  children,
  className,
  style,
}: FormSectionProps) {
  return (
    <View className={cn('mb-6', className)} style={style}>
      <View className="mb-3">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-sm text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      <View className="gap-3">{children}</View>
    </View>
  );
});

// ─── RequiredLabel ───────────────────────────────────────────────────────

interface RequiredLabelProps {
  children: string;
  required?: boolean;
  hint?: string;
}

export const RequiredLabel = memo(function RequiredLabel({
  children,
  required,
  hint,
}: RequiredLabelProps) {
  return (
    <View className="mb-1.5 flex-row items-center">
      <Text className="text-sm font-medium text-foreground">{children}</Text>
      {required ? <Text className="ml-1 text-sm text-destructive">*</Text> : null}
      {hint ? <Text className="ml-2 text-xs text-muted-foreground">({hint})</Text> : null}
    </View>
  );
});

// ─── ValidationMessage ───────────────────────────────────────────────────

export const ValidationMessage = memo(function ValidationMessage({
  message,
  variant = 'error',
}: {
  message?: string;
  variant?: 'error' | 'hint' | 'success';
}) {
  if (!message) return null;
  const color =
    variant === 'error'
      ? 'text-destructive'
      : variant === 'success'
        ? 'text-emerald-600'
        : 'text-muted-foreground';
  return <Text className={cn('mt-1 text-xs', color)}>{message}</Text>;
});

// ─── AppInput (text) ─────────────────────────────────────────────────────

interface AppInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChangeText: (v: string) => void;
  containerClassName?: string;
  multiline?: boolean;
}

export const AppInput = memo(function AppInput({
  label,
  hint,
  required,
  error,
  value,
  onChangeText,
  containerClassName,
  multiline,
  ...rest
}: AppInputProps) {
  return (
    <View className={cn('w-full', containerClassName)}>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <RNTextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#94a3b8"
        className={cn(
          'rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground',
          multiline ? 'min-h-[88px] py-2' : 'h-11',
          error ? 'border-destructive' : ''
        )}
        style={multiline ? styles.multilineInput : styles.singleInput}
      />
      <ValidationMessage
        message={error ?? hint}
        variant={error ? 'error' : 'hint'}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  singleInput: { textAlignVertical: 'center' },
  multilineInput: { textAlignVertical: 'top' },
});

// ─── NumericInput ────────────────────────────────────────────────────────

interface NumericInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string; // raw string to allow empty/partial typing
  onChangeText: (v: string) => void;
  placeholder?: string;
  allowDecimal?: boolean;
  minValue?: number;
  maxValue?: number;
}

export const NumericInput = memo(function NumericInput({
  label,
  required,
  error,
  hint,
  value,
  onChangeText,
  placeholder,
  allowDecimal,
  minValue,
  maxValue,
}: NumericInputProps) {
  const handle = useCallback(
    (raw: string) => {
      // Strip non-numeric characters. Allow one decimal point.
      let cleaned = raw.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, '');
      if (allowDecimal) {
        const firstDot = cleaned.indexOf('.');
        if (firstDot !== -1) {
          cleaned =
            cleaned.slice(0, firstDot + 1) +
            cleaned.slice(firstDot + 1).replace(/\./g, '');
        }
      }
      if (cleaned.length > 1 && cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
        cleaned = cleaned.replace(/^0+/, '') || '0';
      }
      onChangeText(cleaned);
    },
    [allowDecimal, onChangeText]
  );

  const numericValue =
    value && value !== '.' ? parseFloat(value) : Number.NaN;
  let rangeError: string | null = null;
  if (!Number.isNaN(numericValue)) {
    if (typeof minValue === 'number' && numericValue < minValue) {
      rangeError = `Giá trị phải ≥ ${minValue}`;
    } else if (typeof maxValue === 'number' && numericValue > maxValue) {
      rangeError = `Giá trị phải ≤ ${maxValue}`;
    }
  }

  const shownError = error ?? rangeError ?? undefined;

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <RNTextInput
        value={value}
        onChangeText={handle}
        placeholder={placeholder}
        keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
        placeholderTextColor="#94a3b8"
        className={cn(
          'h-11 rounded-lg border border-border bg-card px-3 text-base text-foreground',
          shownError ? 'border-destructive' : ''
        )}
      />
      <ValidationMessage message={shownError ?? hint} variant={shownError ? 'error' : 'hint'} />
    </View>
  );
});

// ─── AppTextArea ─────────────────────────────────────────────────────────

interface AppTextAreaProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  editable?: boolean;
}

export const AppTextArea = memo(function AppTextArea({
  label,
  required,
  error,
  hint,
  value,
  onChangeText,
  placeholder,
  minHeight = 96,
  maxLength,
  editable = true,
}: AppTextAreaProps) {
  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline
        maxLength={maxLength}
        editable={editable}
        className={cn(
          'rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground',
          error ? 'border-destructive' : '',
          !editable ? 'opacity-70' : ''
        )}
        style={[styles.multilineInput, { minHeight }]}
      />
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
    </View>
  );
});

// ─── SelectInput ─────────────────────────────────────────────────────────

interface SelectInputProps<T extends string | number> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: T | null;
  onChange: (v: T) => void;
  options: Array<{ label: string; value: T; hint?: string }>;
  placeholder?: string;
  onPress: () => void;
}

export function SelectInput<T extends string | number>({
  label,
  required,
  error,
  hint,
  value,
  options,
  placeholder,
  onPress,
}: SelectInputProps<T>) {
  const selected = options.find((o) => o.value === value);
  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <Pressable
        onPress={onPress}
        className={cn(
          'h-11 flex-row items-center justify-between rounded-lg border border-border bg-card px-3',
          error ? 'border-destructive' : ''
        )}
      >
        <Text
          className={cn(
            'text-base',
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

// ─── AppSwitch ───────────────────────────────────────────────────────────

interface AppSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export const AppSwitch = memo(function AppSwitch({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: AppSwitchProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-3"
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-foreground">{label}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      <View
        className={cn(
          'h-7 w-12 items-start justify-center rounded-full p-0.5',
          value ? 'bg-primary' : 'bg-muted'
        )}
      >
        <View
          className={cn(
            'h-6 w-6 rounded-full bg-white',
            value ? 'self-end' : 'self-start'
          )}
        />
      </View>
    </Pressable>
  );
});

// ─── FormField — wrapper for stacking label + control + error ────────────

interface FormFieldProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField = memo(function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <View className={className}>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      {children}
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
    </View>
  );
});
