/**
 * Date / Time / DateTime input components.
 *
 * Uses @react-native-community/datetimepicker (already installed).
 * On iOS the picker is shown inline (compact), on Android as a dialog.
 *
 * IMPORTANT: the picker button does NOT cause focus loss on other inputs
 * because DateTimePicker is rendered conditionally only while the user is
 * actively picking.
 */

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { memo, useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import { RequiredLabel, ValidationMessage } from './primitives';

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (d: Date | null) =>
  d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : 'Chọn ngày';

const formatTime = (d: Date | null) =>
  d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : 'Chọn giờ';

const formatDateTime = (d: Date | null) =>
  d
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    : 'Chọn ngày giờ';

// ─── DateInput ───────────────────────────────────────────────────────────

interface DateInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: Date | null;
  onChange: (v: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DateInput = memo(function DateInput({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateInputProps) {
  const [open, setOpen] = useState(false);

  const handle = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (Platform.OS === 'android') setOpen(false);
      if (d) onChange(d);
    },
    [onChange]
  );

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'h-11 flex-row items-center justify-between rounded-lg border border-border bg-card px-3',
          error ? 'border-destructive' : ''
        )}
      >
        <Text
          className={cn(
            'text-base',
            value ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {formatDate(value)}
        </Text>
        <Text className="text-base">📅</Text>
      </Pressable>
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
      {open ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handle}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}
    </View>
  );
});

// ─── TimeInput ───────────────────────────────────────────────────────────

interface TimeInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: Date | null;
  onChange: (v: Date | null) => void;
}

export const TimeInput = memo(function TimeInput({
  label,
  required,
  error,
  hint,
  value,
  onChange,
}: TimeInputProps) {
  const [open, setOpen] = useState(false);

  const handle = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (Platform.OS === 'android') setOpen(false);
      if (d) onChange(d);
    },
    [onChange]
  );

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'h-11 flex-row items-center justify-between rounded-lg border border-border bg-card px-3',
          error ? 'border-destructive' : ''
        )}
      >
        <Text
          className={cn(
            'text-base',
            value ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {formatTime(value)}
        </Text>
        <Text className="text-base">⏰</Text>
      </Pressable>
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
      {open ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handle}
        />
      ) : null}
    </View>
  );
});

// ─── DateTimeInput ───────────────────────────────────────────────────────

interface DateTimeInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: Date | null;
  onChange: (v: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DateTimeInput = memo(function DateTimeInput({
  label,
  required,
  error,
  hint,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimeInputProps) {
  const [mode, setMode] = useState<'idle' | 'date' | 'time'>('idle');

  const handleDate = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (Platform.OS === 'android') {
        if (!d) {
          setMode('idle');
          return;
        }
        // after picking date on Android, switch to time picker
        setMode('time');
        onChange(d);
      } else {
        if (d) onChange(d);
        setMode('idle');
      }
    },
    [onChange]
  );

  const handleTime = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (Platform.OS === 'android') {
        setMode('idle');
      } else {
        setMode('idle');
      }
      if (d && value) {
        const merged = new Date(value);
        merged.setHours(d.getHours());
        merged.setMinutes(d.getMinutes());
        onChange(merged);
      }
    },
    [onChange, value]
  );

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <Pressable
        onPress={() => setMode('date')}
        className={cn(
          'h-11 flex-row items-center justify-between rounded-lg border border-border bg-card px-3',
          error ? 'border-destructive' : ''
        )}
      >
        <Text
          className={cn(
            'text-base',
            value ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {formatDateTime(value)}
        </Text>
        <Text className="text-base">📅⏰</Text>
      </Pressable>
      <ValidationMessage message={error ?? hint} variant={error ? 'error' : 'hint'} />
      {mode === 'date' ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}
      {mode === 'time' ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          is24Hour
          display="default"
          onChange={handleTime}
        />
      ) : null}
    </View>
  );
});
