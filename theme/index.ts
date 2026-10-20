/**
 * NAV_THEME — bridge between the design-system palette and the React
 * Navigation theme contract required by `expo-router`.
 */

import { Theme, DefaultTheme, DarkTheme } from 'expo-router/react-navigation';

import { DARK_COLORS, LIGHT_COLORS } from '@/src/design-system/palette';

const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: LIGHT_COLORS.background,
      border: LIGHT_COLORS.border,
      card: LIGHT_COLORS.surface,
      notification: LIGHT_COLORS.danger,
      primary: LIGHT_COLORS.primary,
      text: LIGHT_COLORS.textPrimary,
    },
    fonts: DefaultTheme.fonts,
  },
  dark: {
    dark: true,
    colors: {
      background: DARK_COLORS.background,
      border: DARK_COLORS.border,
      card: DARK_COLORS.surface,
      notification: DARK_COLORS.danger,
      primary: DARK_COLORS.primary,
      text: DARK_COLORS.textPrimary,
    },
    fonts: DarkTheme.fonts,
  },
};

export { NAV_THEME };
