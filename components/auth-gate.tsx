/**
 * AuthGate — handles auth state hydration and routes between auth/app flows.
 *
 * Prevents flicker:
 *   Splash → Login → Home (BAD — visible flicker)
 *   Splash → Home or Login directly (GOOD — single transition)
 *
 * Redirect rules:
 *   'initializing' → render splash (no redirect)
 *   'authenticated' → redirect to /(app)/home if not already there
 *   'unauthenticated' → redirect to /(auth)/login if not already there
 *   'authenticating' / 'logging_out' / 'error' → STAY (transient states)
 *
 * This means:
 * - Login failure (status='unauthenticated', error set) → stays on Login
 * - Logout in progress (status='logging_out') → stays on Home
 * - Auth error (status='unauthenticated', error set) → stays on Register/ForgotPassword
 */

import { useRouter, useSegments } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { useColorScheme } from '@/lib/useColorScheme';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

function AuthGate(): React.JSX.Element | null {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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

    if (status === 'authenticated') {
      if (!inAppGroup) {
        router.replace('/(app)/home');
      }
    } else {
      // status === 'unauthenticated' — stable non-auth state
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, segments]);

  // Render splash while initializing
  if (status === 'initializing') {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" />
        <Text variant="subhead" color="secondary" className="mt-3">
          Đang tải...
        </Text>
      </View>
    );
  }

  return null;
}

export default AuthGate;
