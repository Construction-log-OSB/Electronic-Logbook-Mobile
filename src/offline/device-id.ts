/**
 * Device-id helper — stable per-install identifier used for sync routing.
 * Stored in SecureStore so it persists across app launches but is per-device.
 *
 * Uses expo-secure-store (always available). expo-application / expo-crypto are
 * optional — we fall back to a UUID generated via uuid package if missing.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuid } from 'uuid';

const KEY = 'logbook.mobile.deviceId';

let cached: string | null = null;

async function platformId(): Promise<string | null> {
  try {
    // Dynamic import; the module may not be installed (optional dep).
    // The string literal is suppressed by ts-ignore because we cannot
    // statically guarantee the package is present.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Application: any = await import(/* webpackIgnore: true */ 'expo-application' as string).catch(
      () => null as unknown as never
    );
    if (!Application) return null;
    if (Platform.OS === 'ios') {
      const id = await Application.getIosIdForVendorAsync?.();
      return id ?? null;
    }
    if (Platform.OS === 'android') {
      const id = await Application.getAndroidId?.();
      return id ?? null;
    }
  } catch {
    // expo-application not installed; fall through
  }
  return null;
}

export async function ensureDeviceId(): Promise<string> {
  if (cached) return cached;
  let id: string | null = null;
  try {
    id = await SecureStore.getItemAsync(KEY);
  } catch {
    id = null;
  }
  if (!id) {
    id = (await platformId()) ?? uuid();
    try {
      await SecureStore.setItemAsync(KEY, id);
    } catch {
      /* non-fatal — we still have the in-memory cached id */
    }
  }
  cached = id;
  return id;
}

export function getDeviceId(): string {
  if (!cached) {
    // Fallback — should be primed by AppProviders on boot.
    cached = 'unknown-device';
  }
  return cached;
}
