/**
 * Design System — single source of truth for spacing, radius, dimensions,
 * shadows, typography, and touch targets.
 *
 * NEVER hardcode raw values in screens or components. Import from here.
 */

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;

export const ScreenPadding = {
  horizontal: Spacing.md,
  vertical: Spacing.md,
  section: Spacing.lg,
} as const;

export const Radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof Radius;

export const BorderWidth = {
  hairline: 1,
  thin: 1,
  thick: 2,
} as const;

export const TouchSize = {
  /** Apple HIG / Material minimum */
  min: 44,
  /** Preferred primary action */
  preferred: 48,
  /** Large primary CTA */
  large: 56,
} as const;

export const IconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

export type IconSizeKey = keyof typeof IconSize;

export const FontSize = {
  caption: 12,
  footnote: 13,
  body: 15,
  callout: 16,
  subhead: 17,
  heading: 18,
  title3: 20,
  title2: 22,
  title1: 26,
  largeTitle: 32,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.5,
} as const;

export const Elevation = {
  none: 'none',
  card: '0 1px 2px rgba(0,0,0,0.05)',
  raised: '0 2px 8px rgba(0,0,0,0.08)',
  modal: '0 8px 24px rgba(0,0,0,0.12)',
} as const;

export const Opacity = {
  disabled: 0.5,
  pressed: 0.7,
  muted: 0.6,
} as const;

export const ZIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

export const Duration = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const;
