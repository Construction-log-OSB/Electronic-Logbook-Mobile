/**
 * Brand — logo and app branding component.
 *
 * Features:
 * - OSB logo with primary color background
 * - App name in Vietnamese
 * - Consistent sizing
 * - Dark mode aware via Tailwind
 */

import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';

interface BrandProps {
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const SIZES = {
  small: {
    container: 'h-12 w-12 rounded-xl',
    text: 'text-xl font-bold',
    spacing: 'gap-2',
  },
  medium: {
    container: 'h-16 w-16 rounded-2xl',
    text: 'text-2xl font-bold',
    spacing: 'gap-3',
  },
  large: {
    container: 'h-20 w-20 rounded-2xl',
    text: 'text-3xl font-bold',
    spacing: 'gap-4',
  },
};

export function Brand({ size = 'medium', showName = true }: BrandProps) {
  const sizeConfig = SIZES[size];

  return (
    <View className="items-center gap-4">
      <View className={`${sizeConfig.container} items-center justify-center bg-primary`}>
        <Text className={`${sizeConfig.text} text-primary-foreground`}>OSB</Text>
      </View>
      {showName ? (
        <View className={`items-center ${sizeConfig.spacing}`}>
          <Text variant="title1" className="text-center font-semibold">
            Nhật ký điện tử
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default Brand;
