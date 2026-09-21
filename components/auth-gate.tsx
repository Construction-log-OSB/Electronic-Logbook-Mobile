/**
 * AuthGate — handles auth state hydration and routes between auth/app flows.
 *
 * Redirect rules:
 *   'initializing' → render splash (no redirect)
 *   'authenticated' → redirect to /(app)/home if not already there
 *   'unauthenticated' → redirect to /(auth)/login if not already there
 *   'authenticating' / 'logging_out' / 'error' → STAY (transient states)
 */

import { useRouter, useSegments } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

function AuthGate(): React.JSX.Element | null {
  const router = useRouter();
  const segments = useSegments();

  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Hydrate auth state on mount
  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Navigate based on stable auth state only
  React.useEffect(() => {
    if (status === 'initializing') return;
    if (status === 'authenticating') return; // hydrating — stay
    if (status === 'logging_out') return; // logging out — stay
    if (status === 'error') return; // auth error — stay on current screen

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    // Only redirect if we're in the WRONG group (not both at once)
    // This prevents both AuthGates from fighting at the root level
    if (status === 'authenticated') {
      // Already in app — stay
      if (inAppGroup) return;
      // Not in app — redirect
      router.replace('/(app)/home');
    } else {
      // status === 'unauthenticated' — stable non-auth state
      // Already in auth — stay
      if (inAuthGroup) return;
      // Not in auth — redirect
      router.replace('/(auth)/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, segments]);

  // Render splash while initializing
  if (status === 'initializing') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text variant="subhead" className="mt-3 text-muted-foreground">
          Đang tải...
        </Text>
      </View>
    );
  }

  return null;
}

export default AuthGate;
