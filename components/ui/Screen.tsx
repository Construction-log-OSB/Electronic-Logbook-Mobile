/**
 * Screen — base component for consistent screen layout.
 *
 * Features:
 * - Safe area handling
 * - Background color based on color scheme
 * - Keyboard avoiding behavior
 * - Consistent padding and spacing
 */

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
  // `bg-background` resolves via the maritime palette CSS var, which already
  // adapts to the active color scheme via prefers-color-scheme in global.css.
  // No hardcoded bg-black/bg-white — see rule #4 in the task spec.
  const backgroundColor = 'bg-background';

  const content = (
    <View className={cn('flex-1 px-4 py-4', contentClassName)}>{children}</View>
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
