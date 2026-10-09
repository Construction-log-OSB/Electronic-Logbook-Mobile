/**
 * ScreenLoading — consistent loading shell for screens that fetch data.
 *
 * Replaces 12+ duplicated blocks of:
 *   <SafeAreaView><ScreenHeader title="X" /><ActivityIndicator /></SafeAreaView>
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

interface ScreenLoadingProps {
  /** Title shown above the spinner. */
  label?: string;
  /** Center on the screen, or top-aligned below a header. */
  align?: 'center' | 'top';
}

function ScreenLoadingBase({
  label = 'Đang tải…',
  align = 'center',
}: ScreenLoadingProps) {
  return (
    <View
      className={`flex-1 items-center justify-center px-6 py-12 ${
        align === 'top' ? 'items-start' : ''
      }`}
    >
      <ActivityIndicator size="large" />
      {label ? (
        <Text variant="subhead" className="mt-3 text-textMuted">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export const ScreenLoading = memo(ScreenLoadingBase);
export default ScreenLoading;
