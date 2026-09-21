/**
 * Root index — redirects to auth or app flow based on auth state.
 *
 * This is the entry point. Shows splash while auth state is hydrating,
 * then redirects to the appropriate flow.
 */

import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

export default function Index() {
  const status = useAuthStore((s) => s.status);

  // While hydrating, show splash (not white blank screen)
  // if (status === 'initializing' || status === 'authenticating' || status === 'logging_out') {
  //   return (
  //     <View className="flex-1 items-center justify-center bg-background">
  //       <ActivityIndicator size="large" />
  //       <Text variant="subhead" className="mt-3 text-muted-foreground">
  //         Đang tải...
  //       </Text>
  //     </View>
  //   );
  // }

  // Stable state — redirect to appropriate flow
  if (status === 'authenticated') {
    return <Redirect href="/(app)/home" />;
  }

  // unauthenticated or error — go to login
  return <Redirect href="/(auth)/login" />;
}
