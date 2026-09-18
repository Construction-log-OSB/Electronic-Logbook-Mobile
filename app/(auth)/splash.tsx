/**
 * Splash Screen — shown while auth state is hydrating.
 * Prevents flicker between Login/Home.
 */

import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/lib/useColorScheme';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

export default function SplashScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <View className="items-center gap-4">
        <ActivityIndicator size="large" />
        <Text variant="subhead" color="secondary">
          Đang tải...
        </Text>
      </View>
    </SafeAreaView>
  );
}
