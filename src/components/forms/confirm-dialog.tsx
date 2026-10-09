/**
 * ConfirmDialog — modal confirmation. Uses React Native's native Modal
 * (presentationStyle="formSheet") which respects platform gestures.
 */

import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { cn } from '@/lib/cn';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-md rounded-2xl bg-card p-5">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>
          {description ? (
            <Text className="mt-2 text-sm text-muted-foreground">{description}</Text>
          ) : null}
          <View className="mt-5 flex-row justify-end gap-2">
            <Pressable
              onPress={onCancel}
              className="h-10 items-center justify-center rounded-lg bg-muted px-4"
            >
              <Text className="text-sm font-medium text-foreground">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={cn(
                'h-10 items-center justify-center rounded-lg px-4',
                destructive ? 'bg-destructive' : 'bg-primary'
              )}
            >
              <Text className="text-sm font-semibold text-primary-foreground">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
