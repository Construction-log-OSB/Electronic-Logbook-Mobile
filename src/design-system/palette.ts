/**
 * Maritime color palette — semantic tokens.
 *
 * Light + Dark themes use DEDICATED palettes (no inversion).
 *
 * Rules:
 *  - NEVER use pure black (#000) or pure white (#FFF) as application surfaces
 *  - Status colors remain recognizable in both themes
 *  - Sufficient contrast between background / surface / text / border
 */

import { Platform } from 'react-native';

export type Palette = {
  // Surface
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  overlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textPlaceholder: string;

  // Border
  border: string;
  borderStrong: string;
  borderFocus: string;

  // Brand
  primary: string;
  primaryPressed: string;
  primaryForeground: string;
  secondary: string;
  accent: string;

  // Status
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Status surfaces (low-alpha backgrounds)
  successSurface: string;
  warningSurface: string;
  dangerSurface: string;
  infoSurface: string;
  neutralSurface: string;

  // Sync UI
  syncSynced: string;
  syncSyncedSurface: string;
  syncPending: string;
  syncPendingSurface: string;
  syncSyncing: string;
  syncSyncingSurface: string;
  syncError: string;
  syncErrorSurface: string;
  syncConflict: string;
  syncConflictSurface: string;
  syncOffline: string;
  syncOfflineSurface: string;

  // Trip status
  tripDraft: string;
  tripPreparing: string;
  tripDeparted: string;
  tripFishing: string;
  tripReturning: string;
  tripCompleted: string;
  tripCancelled: string;

  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Utility
  skeleton: string;
  shadow: string;
};

const light: Palette = {
  background: '#F5F7F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF2F5',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(11, 58, 91, 0.4)',

  textPrimary: '#17212B',
  textSecondary: '#52606D',
  textMuted: '#7B8794',
  textInverse: '#FFFFFF',
  textPlaceholder: '#9AA5B1',

  border: '#D9E0E6',
  borderStrong: '#C2CCD4',
  borderFocus: '#0B3A5B',

  primary: '#0B3A5B',
  primaryPressed: '#082B45',
  primaryForeground: '#FFFFFF',
  secondary: '#176B87',
  accent: '#2A9D8F',

  success: '#2E7D32',
  warning: '#ED8B00',
  danger: '#C62828',
  info: '#1976D2',

  successSurface: '#E6F4EA',
  warningSurface: '#FFF3E0',
  dangerSurface: '#FDECEA',
  infoSurface: '#E3F2FD',
  neutralSurface: '#EEF2F5',

  syncSynced: '#2E7D32',
  syncSyncedSurface: '#E6F4EA',
  syncPending: '#ED8B00',
  syncPendingSurface: '#FFF3E0',
  syncSyncing: '#1976D2',
  syncSyncingSurface: '#E3F2FD',
  syncError: '#C62828',
  syncErrorSurface: '#FDECEA',
  syncConflict: '#C62828',
  syncConflictSurface: '#FDECEA',
  syncOffline: '#52606D',
  syncOfflineSurface: '#EEF2F5',

  tripDraft: '#7B8794',
  tripPreparing: '#ED8B00',
  tripDeparted: '#1976D2',
  tripFishing: '#2A9D8F',
  tripReturning: '#ED8B00',
  tripCompleted: '#176B87',
  tripCancelled: '#C62828',

  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#D9E0E6',
  tabBarActive: '#0B3A5B',
  tabBarInactive: '#7B8794',

  skeleton: '#E1E7EC',
  shadow: 'rgba(11, 58, 91, 0.08)',
};

const dark: Palette = {
  background: '#0F1720',
  surface: '#16212B',
  surfaceSecondary: '#1D2B36',
  surfaceElevated: '#1F2C38',
  overlay: 'rgba(0, 0, 0, 0.55)',

  textPrimary: '#F4F7FA',
  textSecondary: '#B8C2CC',
  textMuted: '#8895A2',
  textInverse: '#17212B',
  textPlaceholder: '#5F6E7A',

  border: '#2B3945',
  borderStrong: '#3A4A57',
  borderFocus: '#5FA9D6',

  primary: '#5FA9D6',
  primaryPressed: '#4F98C4',
  primaryForeground: '#0F1720',
  secondary: '#2A9D8F',
  accent: '#5FA9D6',

  success: '#66BB6A',
  warning: '#FFA726',
  danger: '#EF5350',
  info: '#42A5F5',

  successSurface: '#1E3324',
  warningSurface: '#3A2E1A',
  dangerSurface: '#3A1F1F',
  infoSurface: '#1A2A3A',
  neutralSurface: '#1D2B36',

  syncSynced: '#66BB6A',
  syncSyncedSurface: '#1E3324',
  syncPending: '#FFA726',
  syncPendingSurface: '#3A2E1A',
  syncSyncing: '#42A5F5',
  syncSyncingSurface: '#1A2A3A',
  syncError: '#EF5350',
  syncErrorSurface: '#3A1F1F',
  syncConflict: '#EF5350',
  syncConflictSurface: '#3A1F1F',
  syncOffline: '#8895A2',
  syncOfflineSurface: '#1D2B36',

  tripDraft: '#8895A2',
  tripPreparing: '#FFA726',
  tripDeparted: '#42A5F5',
  tripFishing: '#2A9D8F',
  tripReturning: '#FFA726',
  tripCompleted: '#5FA9D6',
  tripCancelled: '#EF5350',

  tabBarBackground: '#16212B',
  tabBarBorder: '#2B3945',
  tabBarActive: '#5FA9D6',
  tabBarInactive: '#8895A2',

  skeleton: '#2B3945',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

/** Nativewind/CVA-friendly: pass-through Platform check is no longer used here.
 *  Consumers should use `useColors()` from `use-colors.ts` (respects color scheme).
 */
export const COLORS = Platform.OS === 'ios' ? light : light; // kept for backwards compat

export const LIGHT_COLORS = light;
export const DARK_COLORS = dark;
