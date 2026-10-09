/**
 * Tabs Layout — main bottom tab navigation for authenticated users.
 *
 * Migrated to the maritime palette tokens. Hardcoded iOS-blue removed.
 * Bottom bar uses the dedicated semantic tab-bar colors and respects
 * the framework's safe-area handling (height managed by expo-router +
 * react-native-screens, not via hardcoded device offsets).
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import * as React from 'react';
import type { ColorValue } from 'react-native';

import { useColorScheme } from '@/lib/useColorScheme';
import { LIGHT_COLORS, DARK_COLORS } from '@/src/design-system/palette';
import { FontSize, FontWeight, TouchSize } from '@/src/design-system/tokens';

type TabIconName = 'home' | 'anchor' | 'bell' | 'account';
type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICON_MAP: Record<TabIconName, MCIName> = {
  home: 'home-outline',
  anchor: 'anchor',
  bell: 'bell-outline',
  account: 'account-outline',
};

function TabIcon({ name, color }: { name: TabIconName; color: ColorValue }) {
  return (
    <MaterialCommunityIcons
      name={ICON_MAP[name]}
      size={24}
      color={color}
    />
  );
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Hide the tab bar inside modal-style routes (creation, sync, trip workspace)
  // so it doesn't overlap content area on those screens.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tabBarActive,
        tabBarInactiveTintColor: palette.tabBarInactive,
        tabBarStyle: {
          backgroundColor: palette.tabBarBackground,
          borderTopColor: palette.tabBarBorder,
          borderTopWidth: 0.5,
          // Tab-bar height is intentionally expressed via icon/label padding
          // only. Bottom safe-area is handled by the native bottom-tabs
          // implementation (expo-router + react-native-screens), NOT by
          // hardcoded device offsets.
          paddingTop: 6,
          paddingBottom: 6,
          minHeight: TouchSize.large,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.caption,
          fontWeight: FontWeight.medium as '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Chuyến biển',
          tabBarIcon: ({ color }) => <TabIcon name="anchor" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => <TabIcon name="bell" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <TabIcon name="account" color={color as string} />,
        }}
      />
    </Tabs>
  );
}
