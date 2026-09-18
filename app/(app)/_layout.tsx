import { Stack } from 'expo-router';
import * as React from 'react';

import AuthGate from '@/components/auth-gate';

export default function AppLayout() {
  return (
    <>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Stack.Screen name="home" />
      </Stack>
    </>
  );
}
