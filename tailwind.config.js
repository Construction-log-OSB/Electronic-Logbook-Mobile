const { hairlineWidth, platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  darkMode: 'class', // Enable manual toggling of dark mode
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: withOpacity('border'),
        input: withOpacity('input'),
        ring: withOpacity('ring'),
        background: withOpacity('background'),
        foreground: withOpacity('foreground'),
        primary: {
          DEFAULT: withOpacity('primary'),
          foreground: withOpacity('primary-foreground'),
        },
        secondary: {
          DEFAULT: withOpacity('secondary'),
          foreground: withOpacity('secondary-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('destructive'),
          foreground: withOpacity('destructive-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('muted'),
          foreground: withOpacity('muted-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('accent'),
          foreground: withOpacity('accent-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('popover'),
          foreground: withOpacity('popover-foreground'),
        },
        card: {
          DEFAULT: withOpacity('card'),
          foreground: withOpacity('card-foreground'),
        },
        grey1: `rgb(var(--grey1) / <alpha-value>)`,
        grey2: `rgb(var(--grey2) / <alpha-value>)`,
        grey3: `rgb(var(--grey3) / <alpha-value>)`,
        grey4: `rgb(var(--grey4) / <alpha-value>)`,
        grey5: `rgb(var(--grey5) / <alpha-value>)`,
        grey6: `rgb(var(--grey6) / <alpha-value>)`,

        // Semantic text
        textPrimary: `rgb(var(--text-primary) / <alpha-value>)`,
        textSecondary: `rgb(var(--text-secondary) / <alpha-value>)`,
        textMuted: `rgb(var(--text-muted) / <alpha-value>)`,
        textPlaceholder: `rgb(var(--text-placeholder) / <alpha-value>)`,
        textInverse: `rgb(var(--text-inverse) / <alpha-value>)`,

        // Semantic surfaces
        surface: `rgb(var(--card) / <alpha-value>)`,
        surfaceSecondary: `rgb(var(--surface-secondary) / <alpha-value>)`,
        surfaceElevated: `rgb(var(--surface-elevated) / <alpha-value>)`,

        // Status (semantic)
        success: `rgb(var(--success) / <alpha-value>)`,
        warning: `rgb(var(--warning) / <alpha-value>)`,
        danger: `rgb(var(--danger) / <alpha-value>)`,
        info: `rgb(var(--info) / <alpha-value>)`,
        successSurface: `rgb(var(--success-surface) / <alpha-value>)`,
        warningSurface: `rgb(var(--warning-surface) / <alpha-value>)`,
        dangerSurface: `rgb(var(--danger-surface) / <alpha-value>)`,
        infoSurface: `rgb(var(--info-surface) / <alpha-value>)`,
        neutralSurface: `rgb(var(--neutral-surface) / <alpha-value>)`,

        // Sync
        syncSynced: `rgb(var(--sync-synced) / <alpha-value>)`,
        syncSyncedSurface: `rgb(var(--sync-synced-surface) / <alpha-value>)`,
        syncPending: `rgb(var(--sync-pending) / <alpha-value>)`,
        syncPendingSurface: `rgb(var(--sync-pending-surface) / <alpha-value>)`,
        syncSyncing: `rgb(var(--sync-syncing) / <alpha-value>)`,
        syncSyncingSurface: `rgb(var(--sync-syncing-surface) / <alpha-value>)`,
        syncError: `rgb(var(--sync-error) / <alpha-value>)`,
        syncErrorSurface: `rgb(var(--sync-error-surface) / <alpha-value>)`,
        syncConflict: `rgb(var(--sync-conflict) / <alpha-value>)`,
        syncConflictSurface: `rgb(var(--sync-conflict-surface) / <alpha-value>)`,
        syncOffline: `rgb(var(--sync-offline) / <alpha-value>)`,
        syncOfflineSurface: `rgb(var(--sync-offline-surface) / <alpha-value>)`,

        // Trip status
        tripDraft: `rgb(var(--trip-draft) / <alpha-value>)`,
        tripPreparing: `rgb(var(--trip-preparing) / <alpha-value>)`,
        tripDeparted: `rgb(var(--trip-departed) / <alpha-value>)`,
        tripFishing: `rgb(var(--trip-fishing) / <alpha-value>)`,
        tripReturning: `rgb(var(--trip-returning) / <alpha-value>)`,
        tripCompleted: `rgb(var(--trip-completed) / <alpha-value>)`,
        tripCancelled: `rgb(var(--trip-cancelled) / <alpha-value>)`,

        // Tab bar
        tabBarBackground: `rgb(var(--tab-bar-background) / <alpha-value>)`,
        tabBarBorder: `rgb(var(--tab-bar-border) / <alpha-value>)`,
        tabBarActive: `rgb(var(--tab-bar-active) / <alpha-value>)`,
        tabBarInactive: `rgb(var(--tab-bar-inactive) / <alpha-value>)`,

        // Utility
        skeleton: `rgb(var(--skeleton) / <alpha-value>)`,
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `rgb(var(--${variableName}) / ${opacityValue})`,
        android: `rgb(var(--android-${variableName}) / ${opacityValue})`,
      });
    }
    return platformSelect({
      ios: `rgb(var(--${variableName}))`,
      android: `rgb(var(--android-${variableName}))`,
    });
  };
}
