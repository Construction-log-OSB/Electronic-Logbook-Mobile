/**
 * Auth Layout — wrapper for unauthenticated screens (login, register, forgot password).
 *
 * AuthGate is intentionally NOT mounted here. Routing is handled exclusively
 * by the root AuthGate in app/_layout.tsx to avoid conflicting redirects.
 */

import { Stack } from 'expo-router';
import * as React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
