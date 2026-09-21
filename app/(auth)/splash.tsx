/**
 * Splash Screen — shown while auth state is hydrating.
 * Prevents flicker between Login/Home.
 */

import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <View className="items-center gap-4">
        <ActivityIndicator size="large" />
        <Text variant="subhead" className="text-muted-foreground">
          Đang tải...
        </Text>
      </View>
    </SafeAreaView>
  );
}
