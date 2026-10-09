/**
 * Toast host — mounted by the root layout. Listens to global toast events
 * and renders a stack at the top of the screen.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { onToast } from '@/src/lib/toast';

interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  durationMs?: number;
}

const VARIANT_BG: Record<Toast['variant'], string> = {
  success: 'bg-emerald-100 border-emerald-300',
  error: 'bg-red-100 border-red-300',
  warning: 'bg-amber-100 border-amber-300',
  info: 'bg-blue-100 border-blue-300',
};

const VARIANT_TEXT: Record<Toast['variant'], string> = {
  success: 'text-emerald-900',
  error: 'text-red-900',
  warning: 'text-amber-900',
  info: 'text-blue-900',
};

export const ToastHost = memo(function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onToast((t) => {
      setToasts((prev) => [...prev, t]);
      const ms = t.durationMs ?? 2500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, ms);
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      <View className="gap-1.5 px-3 pt-2">
        {toasts.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => dismiss(t.id)}
            className={`rounded-lg border px-3 py-2 ${VARIANT_BG[t.variant]}`}
          >
            <Animated.View>
              <Text className={`text-sm font-medium ${VARIANT_TEXT[t.variant]}`}>
                {t.message}
              </Text>
            </Animated.View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
});
