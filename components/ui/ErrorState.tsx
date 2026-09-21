/**
 * ErrorState — shown when an error occurs.
 *
 * Features:
 * - Error icon
 * - User-friendly error message
 * - Optional retry action
 * - No technical details exposed to user
 * - Dark mode aware via Tailwind
 */

import * as React from 'react';
import { View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const DEFAULT_MESSAGES = {
  network: 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.',
  server: 'Máy chủ đang bận. Vui lòng thử lại sau.',
  unknown: 'Có lỗi xảy ra. Vui lòng thử lại.',
};

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  retryLabel = 'Thử lại',
}: ErrorStateProps) {
  const displayMessage = message ?? DEFAULT_MESSAGES.unknown;

  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="bg-destructive/10 h-16 w-16 items-center justify-center rounded-full">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={32}
          color="rgb(var(--destructive))"
        />
      </View>
      <View className="items-center gap-2">
        <Text variant="title3" className="text-center font-semibold">
          {title}
        </Text>
        <Text variant="subhead" className="text-center text-muted-foreground">
          {displayMessage}
        </Text>
      </View>
      {onRetry ? (
        <Button variant="secondary" size="md" onPress={onRetry}>
          <Text className="font-medium">{retryLabel}</Text>
        </Button>
      ) : null}
    </View>
  );
}

export default ErrorState;
