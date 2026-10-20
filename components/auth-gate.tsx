/**
 * AuthGate — handles auth state hydration and routes between auth/app flows.
 *
 * IMPORTANT: This component does NOT render any UI. It exists solely to:
 *   1. Trigger hydrate() exactly once on mount
 *   2. Redirect to the correct route group when auth state is stable
 *
 * Splash UI is rendered by `app/index.tsx` which can be controlled centrally.
 */

import { useRouter, useSegments } from 'expo-router';
import * as React from 'react';

import { useAuthStore } from '@/src/auth/store/auth.store';

// Track whether hydration has been triggered across all AuthGate instances
let hydrationStarted = false;

function AuthGate(): null {
  const router = useRouter();
  const segments = useSegments();

  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Hydrate auth state only ONCE across all AuthGate instances
  React.useEffect(() => {
    if (hydrationStarted) return;
    hydrationStarted = true;
    void hydrate();
  }, [hydrate]);

  // Navigate based on stable auth state only
  React.useEffect(() => {
    // Skip during transient states
    if (status === 'initializing') return;
    if (status === 'authenticating') return;
    if (status === 'logging_out') return;
    if (status === 'error') return;

    // segments is a tuple of length >= 1 in Expo Router — index [0] is always safe
    const firstSegment = (segments as readonly string[])[0];
    const inAuthGroup = firstSegment === '(auth)';
    const inAppGroup = firstSegment === '(app)';

    if (status === 'authenticated') {
      if (inAppGroup) return;
      router.replace('/(app)/(tabs)' as any);
    } else {
      if (inAuthGroup) return;
      router.replace('/(auth)/login' as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, segments]);

  // No UI — this component is a side-effect-only guard
  return null;
}

export default AuthGate;
