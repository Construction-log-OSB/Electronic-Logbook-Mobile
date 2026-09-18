import { Stack } from 'expo-router';
import * as React from 'react';

import AuthGate from '@/components/auth-gate';

export default function AuthLayout() {
  return (
    <>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </>
  );
}
