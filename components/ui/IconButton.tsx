/**
 * IconButton — accessible icon-only button.
 *
 * Guarantees a 44pt minimum hit target even when the icon itself is small,
 * and provides optional label for screen readers.
 */

import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { cn } from '@/lib/cn';

interface IconButtonProps {
  /** MaterialCommunityIcons icon name. */
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  /** Color via semantic token. Defaults to "text-foreground". */
  colorClassName?: string;
  /** Background color class for the button (e.g. bg-surfaceSecondary). */
  bgClassName?: string;
  /** Force a bigger tap area. */
  size?: 'sm' | 'md' | 'lg';
  hitSlop?: number;
  className?: string;
}

function IconButtonBase({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
  colorClassName = 'text-foreground',
  bgClassName,
  size = 'md',
  hitSlop = 8,
  className,
}: IconButtonProps) {
  const sizeClass =
    size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-11 w-11';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className={cn(
        'items-center justify-center rounded-full active:opacity-70',
        sizeClass,
        bgClassName,
        className
      )}
    >
      <View>
        <MaterialCommunityIcons
          name={icon as any}
          size={iconSize}
          className={colorClassName}
        />
      </View>
    </Pressable>
  );
}

export const IconButton = memo(IconButtonBase);
export default IconButton;
