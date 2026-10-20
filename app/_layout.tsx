import '@/global.css';

import * as React from 'react';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AuthGate from '@/components/auth-gate';
import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/theme';
import { ToastHost } from '@/src/components/toast-host';
import { SyncBootstrap } from '@/src/components/sync/sync-bootstrap';
import { setAuthBridge } from '@/src/auth/api/client';
import { useAuthStore } from '@/src/auth/store/auth.store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const { applyRefreshedTokens, forceUnauthenticated } = useAuthStore();

  // Wire the apiClient refresh bridge into the auth store so that:
  //  - successful refresh → tokens stay in sync with the store
  //  - failed refresh → store is forced to unauthenticated with a message
  React.useEffect(() => {
    setAuthBridge({
      onTokensRefreshed: applyRefreshedTokens,
      onSessionExpired: forceUnauthenticated,
    });
  }, [applyRefreshedTokens, forceUnauthenticated]);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <NavThemeProvider value={NAV_THEME[colorScheme]}>
            {/*
              AuthGate handles hydration ONCE at the top of the tree.
              It performs no UI rendering — splash is shown by app/index.tsx.
              Routing decisions happen after hydration completes.
            */}
            <AuthGate />
            <SyncBootstrap />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
            <ToastHost />
          </NavThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </>
  );
}
