/**
 * EmptyState — shown when there's no data to display.
 *
 * Features:
 * - Icon with semantic meaning
 * - Title and description
 * - Optional action button
 * - Dark mode aware via Tailwind
 */

import * as React from 'react';
import { View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MaterialCommunityIcons name={icon as any} size={32} color="rgb(var(--muted-foreground))" />
      </View>
      <View className="items-center gap-2">
        <Text variant="title3" className="text-center font-semibold">
          {title}
        </Text>
        {description ? (
          <Text variant="subhead" className="text-center text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button variant="secondary" size="md" onPress={onAction}>
          <Text className="font-medium">{actionLabel}</Text>
        </Button>
      ) : null}
    </View>
  );
}

export default EmptyState;
