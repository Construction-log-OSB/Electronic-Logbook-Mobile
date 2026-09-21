/**
 * LoadingState — shown during async operations.
 *
 * Features:
 * - Centered spinner with label
 * - Dark mode aware
 * - Customizable label
 */

import * as React from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

interface LoadingStateProps {
  label?: string;
  size?: 'small' | 'large';
}

const DEFAULT_LABELS = {
  small: 'Đang tải...',
  large: 'Đang xử lý...',
};

export function LoadingState({ label, size = 'small' }: LoadingStateProps) {
  const displayLabel = label ?? DEFAULT_LABELS[size];

  return (
    <View className="flex-1 items-center justify-center gap-3 py-12">
      <ActivityIndicator size={size} />
      <Text variant="subhead" color="secondary">
        {displayLabel}
      </Text>
    </View>
  );
}

export default LoadingState;
