/**
 * useColors — palette hook respecting the active color scheme.
 *
 * Use this in any component that needs to read raw palette values (e.g. for
 * `style={{ backgroundColor }}` props). For NativeWind class-based styling,
 * use the semantic Tailwind classes instead.
 *
 * Example:
 *   const colors = useColors();
 *   <View style={{ backgroundColor: colors.primary }} />
 */

import { useColorScheme } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS, Palette } from './palette';

export function useColors(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}
