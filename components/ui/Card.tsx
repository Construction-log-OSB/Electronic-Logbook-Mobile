/**
 * Card — consistent card styling for the app.
 *
 * Features:
 * - Dark mode aware via Tailwind
 * - Semantic background colors
 * - Border colors for contrast
 * - Border radius with continuous curve
 */

import { cn } from '@/lib/cn';
import * as React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const baseClasses = 'rounded-2xl border p-4';
  const variantClasses = {
    default: 'bg-card border-border',
    elevated: 'bg-card border-transparent',
  };

  return (
    <View
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ borderCurve: 'continuous' }}
      {...props}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <View className={cn('gap-1', className)}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <View className={className}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn('gap-2', className)}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <View className={cn('flex-row gap-3 pt-2', className)}>{children}</View>;
}

export default Card;
