/**
 * ScreenHeader — consistent top bar pattern.
 *
 * Owns its own TOP safe-area inset so the header is always rendered below
 * the status bar / notch / Dynamic Island regardless of the parent
 * <SafeAreaView edges=...> configuration. This is the only correct way to
 * guarantee consistent header placement across iOS and Android without
 * each screen having to remember `edges={['top', 'bottom']}`.
 *
 * Bottom safe-area is the responsibility of the parent <SafeAreaView edges=['bottom']>
 * (or the screen container), so the header does not apply bottom inset here.
 *
 * Uses native iOS chevron back-button on iOS and the standard header on
 * Android. Pass `right` for trailing actions (status badge, settings).
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { Radius } from '@/src/design-system/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  showBack = true,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Apply the top safe-area inset as padding so the header clears the
  // status bar / notch / Dynamic Island on every device.
  const topPadding = insets.top;

  return (
    <View
      className={cn(
        'flex-row items-center justify-between border-b border-border bg-card px-3',
        className
      )}
      style={{ paddingTop: topPadding, paddingBottom: 12 }}
    >
      <View className="flex-1 flex-row items-center gap-2">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={10}
            className="items-center justify-center active:opacity-60"
            style={{
              width: 40,
              height: 40,
              borderRadius: Radius.md,
              minHeight: 44,
            }}
          >
            <Text className="text-2xl text-foreground">
              {Platform.OS === 'ios' ? '‹' : '←'}
            </Text>
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text
            className="text-lg font-semibold text-foreground"
            numberOfLines={1}
            accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}