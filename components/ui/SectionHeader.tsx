/**
 * SectionHeader — standardized header for a content section.
 *
 * Used across Home dashboard, Trip Detail, Vessel Detail and detail sub-pages.
 * Replaces ad-hoc `View className="mb-2 flex-row items-center justify-between"`
 * patterns that appeared in nearly every screen.
 *
 * Anatomy:
 *   <SectionHeader
 *     title="Hoạt động khai thác"
 *     count={3}
 *     actionLabel="Ghi hoạt động"
 *     onAction={...}
 *   />
 *
 * Variants:
 *  - default  (title + optional count + optional action button)
 *  - simple   (title only, no action)
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

interface SectionHeaderProps {
  title: string;
  count?: number;
  summary?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Show small "see all" style action without heavy button styling. */
  actionMinimal?: boolean;
  className?: string;
}

function SectionHeaderBase({
  title,
  count,
  summary,
  actionLabel,
  onAction,
  actionMinimal = false,
  className,
}: SectionHeaderProps) {
  return (
    <View className={`mb-2 flex-row items-center justify-between ${className ?? ''}`}>
      <View className="flex-1 pr-3">
        <Text variant="heading" className="font-semibold text-foreground">
          {title}
          {typeof count === 'number' && count > 0 ? (
            <Text variant="heading" className="font-semibold text-textMuted">
              {` (${count})`}
            </Text>
          ) : null}
        </Text>
        {summary ? (
          <Text variant="footnote" className="mt-0.5 text-textMuted">
            {summary}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        actionMinimal ? (
          <Button
            variant="plain"
            size="sm"
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text variant="footnote" className="font-semibold text-primary">
              {actionLabel}
            </Text>
          </Button>
        ) : (
          <Button
            variant="tonal"
            size="sm"
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text className="text-primary">{actionLabel}</Text>
          </Button>
        )
      ) : null}
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderBase);
export default SectionHeader;
