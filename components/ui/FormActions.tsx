/**
 * FormActions — Cancel / Save button row for bottom of forms.
 *
 * Replaces the duplicated Cancel + Save button row that appeared in 5+
 * form screens (operation/fuel/incident/port-call/landing).
 *
 * Ensures minimum 48pt height for both buttons, fixed flex layout, and a
 * consistent busy state.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  /** Render submit button as destructive (red). Use sparingly. */
  destructive?: boolean;
  /** Disable submit (e.g. invalid form). */
  disabled?: boolean;
}

function FormActionsBase({
  onCancel,
  onSubmit,
  submitting = false,
  submitLabel = 'Lưu',
  cancelLabel = 'Huỷ',
  destructive = false,
  disabled = false,
}: FormActionsProps) {
  return (
    <View className="mt-4 flex-row gap-2">
      <Button
        variant="secondary"
        size="lg"
        onPress={onCancel}
        disabled={submitting}
        className="flex-1"
        style={{ borderCurve: 'continuous' }}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        <Text className="font-medium text-foreground">{cancelLabel}</Text>
      </Button>
      <Button
        variant="primary"
        size="lg"
        onPress={onSubmit}
        disabled={submitting || disabled}
        className="flex-1"
        style={{
          borderCurve: 'continuous',
          backgroundColor: destructive ? 'rgb(var(--danger))' : undefined,
        }}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        accessibilityState={{ busy: submitting, disabled: submitting || disabled }}
      >
        {submitting ? (
          <ActivityIndicator color="rgb(var(--primary-foreground))" />
        ) : (
          <Text className="font-semibold text-primary-foreground">
            {submitLabel}
          </Text>
        )}
      </Button>
    </View>
  );
}

export const FormActions = memo(FormActionsBase);
export default FormActions;
