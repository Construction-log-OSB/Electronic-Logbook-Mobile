/**
 * Root index — renders splash during hydration, then redirects based on auth state.
 *
 * This is the first screen users see. It waits for AuthGate (mounted at root)
 * to complete hydration, then redirects to the appropriate route group.
 */

import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

export default function Index() {
  const status = useAuthStore((s) => s.status);

  // While hydrating (initial state), show splash
  if (status === 'initializing' || status === 'authenticating') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text variant="subhead" className="mt-3 text-muted-foreground">
          Đang tải...
        </Text>
      </View>
    );
  }

  // Hydration complete — redirect based on auth state
  if (status === 'authenticated') {
    return <Redirect href={'/(app)/(tabs)' as any} />;
  }

  // unauthenticated / error — go to login
  return <Redirect href="/(auth)/login" />;
}
