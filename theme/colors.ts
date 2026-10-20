/**
 * Theme — bridge layer for the existing `COLORS` consumer.
 *
 * Kept as a stable export so any code that imports `COLORS` from
 * `@/theme/colors` continues to compile. New code should import from
 * `@/src/design-system/palette` and use the `useColors()` hook.
 */

import { DARK_COLORS, LIGHT_COLORS } from '@/src/design-system/palette';

export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  light: {
    grey6: '#F5F7F9',
    grey5: '#D9E0E6',
    grey4: '#C2CCD4',
    grey3: '#9AA5B1',
    grey2: '#7B8794',
    grey: '#52606D',
    background: LIGHT_COLORS.background,
    foreground: LIGHT_COLORS.textPrimary,
    root: LIGHT_COLORS.surface,
    card: LIGHT_COLORS.surface,
    cardForeground: LIGHT_COLORS.textPrimary,
    popover: LIGHT_COLORS.surfaceSecondary,
    popoverForeground: LIGHT_COLORS.textPrimary,
    destructive: LIGHT_COLORS.danger,
    primary: LIGHT_COLORS.primary,
    primaryForeground: LIGHT_COLORS.primaryForeground,
    secondary: LIGHT_COLORS.secondary,
    secondaryForeground: LIGHT_COLORS.textInverse,
    muted: LIGHT_COLORS.surfaceSecondary,
    mutedForeground: LIGHT_COLORS.textMuted,
    accent: LIGHT_COLORS.accent,
    accentForeground: LIGHT_COLORS.textInverse,
    border: LIGHT_COLORS.border,
    input: LIGHT_COLORS.border,
    ring: LIGHT_COLORS.border,
  },
  dark: {
    grey6: '#0F1720',
    grey5: '#2B3945',
    grey4: '#3A4A57',
    grey3: '#5F6E7A',
    grey2: '#8895A2',
    grey: '#B8C2CC',
    background: DARK_COLORS.background,
    foreground: DARK_COLORS.textPrimary,
    root: DARK_COLORS.surface,
    card: DARK_COLORS.surface,
    cardForeground: DARK_COLORS.textPrimary,
    popover: DARK_COLORS.surfaceSecondary,
    popoverForeground: DARK_COLORS.textPrimary,
    destructive: DARK_COLORS.danger,
    primary: DARK_COLORS.primary,
    primaryForeground: DARK_COLORS.primaryForeground,
    secondary: DARK_COLORS.secondary,
    secondaryForeground: DARK_COLORS.textInverse,
    muted: DARK_COLORS.surfaceSecondary,
    mutedForeground: DARK_COLORS.textMuted,
    accent: DARK_COLORS.accent,
    accentForeground: DARK_COLORS.textInverse,
    border: DARK_COLORS.border,
    input: DARK_COLORS.border,
    ring: DARK_COLORS.border,
  },
} as const;
