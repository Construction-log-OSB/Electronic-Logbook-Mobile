/**
 * Screen — base component for consistent screen layout.
 *
 * Features:
 * - Safe area handling
 * - Background color based on color scheme
 * - Keyboard avoiding behavior
 * - Consistent padding and spacing
 */

import { useColorScheme } from '@/lib/useColorScheme';
import { cn } from '@/lib/cn';
import * as React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

type Edge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  edges?: Edge[];
  contentClassName?: string;
}

const DEFAULT_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

export function Screen({
  children,
  className,
  scrollable = false,
  keyboardAvoiding = true,
  edges = DEFAULT_EDGES,
  contentClassName,
}: ScreenProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'bg-black' : 'bg-white';

  const content = scrollable ? (
    <View className={cn('flex-1 px-6 py-6', contentClassName)}>{children}</View>
  ) : (
    <View className={cn('flex-1 px-6 py-6', contentClassName)}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView className={cn('flex-1', backgroundColor, className)} edges={edges}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            className="flex-1"
            accessible={false}>
            {content}
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn('flex-1', backgroundColor, className)} edges={edges}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="flex-1" accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default Screen;
