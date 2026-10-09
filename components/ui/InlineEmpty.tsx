/**
 * InlineEmpty — empty state placeholder for list sections inside a screen.
 *
 * Replaces the duplicated dashed-border card with centered text that appeared
 * 6+ times across trip sub-screens.
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Text } from '@/components/nativewindui/Text';

interface InlineEmptyProps {
  message: string;
  icon?: string;
  /** Optional CTA button rendered below the message. */
  actionLabel?: string;
  onAction?: () => void;
}

function InlineEmptyBase({ message, icon, actionLabel, onAction }: InlineEmptyProps) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-6 py-8">
      {icon ? (
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          className="text-textMuted"
        />
      ) : null}
      <Text variant="footnote" className="text-center text-textMuted">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Text
          variant="footnote"
          className="font-semibold text-primary"
          onPress={onAction}
          accessibilityRole="link"
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export const InlineEmpty = memo(InlineEmptyBase);
export default InlineEmpty;
