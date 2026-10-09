/**
 * SkeletonCard — placeholder rendered while data is loading.
 *
 * Provides a more pleasant loading UX than a single spinner for content
 * screens. Uses the design-system `skeleton` token (subtle animated surface).
 */

import React, { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

interface SkeletonCardProps {
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

function SkeletonCardBase({
  rows = 3,
  showHeader = true,
  className,
}: SkeletonCardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-border bg-surface p-4',
        className
      )}
      accessibilityRole="none"
      accessibilityLabel="Đang tải"
    >
      {showHeader ? (
        <View className="mb-3 gap-2">
          <View className="h-5 w-1/2 rounded-md bg-skeleton" />
          <View className="h-3 w-1/3 rounded-md bg-skeleton" />
        </View>
      ) : null}
      <View className="gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <View
            key={i}
            className="h-3 rounded-md bg-skeleton"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </View>
    </View>
  );
}

export const SkeletonCard = memo(SkeletonCardBase);

/**
 * SkeletonList — multiple SkeletonCards stacked for full-screen loading.
 */
function SkeletonListBase({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3 px-4 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={3 - (i % 2)} />
      ))}
    </View>
  );
}

export const SkeletonList = memo(SkeletonListBase);

interface SkeletonTextProps {
  width?: number | string;
  height?: number;
  className?: string;
}

function SkeletonTextBase({
  width = '100%',
  height = 12,
  className,
}: SkeletonTextProps) {
  return (
    <View
      className={cn('rounded-md bg-skeleton', className)}
      style={{ width: width as any, height }}
    />
  );
}

export const SkeletonText = memo(SkeletonTextBase);
// Suppress unused warning for Text re-export in some bundlers.
void Text;
