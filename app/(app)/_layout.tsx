/**
 * App Layout — authenticated app shell.
 *
 * - Bottom tab navigation is handled by (tabs)/_layout.tsx
 * - Modal presentations (trip workspace sub-screens, create trip) use
 *   the system modal transition so iOS/Android behave naturally.
 * - Safe-area is delegated to the native stack + react-native-safe-area-context;
 *   no hardcoded paddings for notch / home indicator.
 * - AuthGate is intentionally NOT mounted here. Routing is handled
 *   exclusively by the root AuthGate in app/_layout.tsx to avoid
 *   conflicting redirects.
 */

import { Stack } from 'expo-router';
import * as React from 'react';

import { OfflineBanner } from '@/src/components/sync/banners';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/screen-header';

export default function AppLayout() {
  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Vessels — non-modal, native push */}
        <Stack.Screen name="vessels/index" options={{ headerShown: false }} />
        <Stack.Screen name="vessels/[id]" options={{ headerShown: false }} />

        {/* Create trip — modal */}
        <Stack.Screen
          name="trips/create"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />

        {/* Trip detail — push */}
        <Stack.Screen name="trips/[id]" options={{ headerShown: false }} />

        {/* Trip workspace sub-routes — modal presentations */}
        <Stack.Screen
          name="trips/[id]/crew"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/operation"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/catch"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/fuel"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/incident"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/port-call"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/landing"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="trips/[id]/documents"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="trips/[id]/forms/[code]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="sync"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

// Re-export so screens can use them in a single import.
export { OfflineBanner, Screen, ScreenHeader };
