/**
 * PhotoPicker — camera + gallery picker.
 * DocumentPicker — file picker.
 *
 * Both return a generic file descriptor that can be uploaded via
 * Document Service. They never assume upload succeeds — caller decides.
 */

import React, { memo, useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { cn } from '@/lib/cn';

export interface PickedFile {
  uri: string;
  name: string;
  type: string; // mime
  size?: number;
}

interface PhotoPickerProps {
  label?: string;
  value?: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
}

export const PhotoPicker = memo(function PhotoPicker({
  label,
  value,
  onChange,
}: PhotoPickerProps) {
  const [busy, setBusy] = useState(false);

  const pickFromCamera = useCallback(async () => {
    try {
      setBusy(true);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.granted !== true) {
        Alert.alert('Cần quyền truy cập máy ảnh');
        return;
      }
      const r = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (r.canceled || !r.assets?.[0]) return;
      const a = r.assets[0];
      onChange({
        uri: a.uri,
        name: a.fileName ?? `photo-${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
        size: a.fileSize,
      });
    } finally {
      setBusy(false);
    }
  }, [onChange]);

  const pickFromGallery = useCallback(async () => {
    try {
      setBusy(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.granted !== true) {
        Alert.alert('Cần quyền truy cập thư viện ảnh');
        return;
      }
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (r.canceled || !r.assets?.[0]) return;
      const a = r.assets[0];
      onChange({
        uri: a.uri,
        name: a.fileName ?? `photo-${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
        size: a.fileSize,
      });
    } finally {
      setBusy(false);
    }
  }, [onChange]);

  const clear = useCallback(() => onChange(null), [onChange]);

  return (
    <View>
      {label ? <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text> : null}
      {value ? (
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-3">
          <View className="flex-1 pr-3">
            <Text className="text-base text-foreground" numberOfLines={1}>
              {value.name}
            </Text>
            {value.size ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {(value.size / 1024).toFixed(1)} KB
              </Text>
            ) : null}
          </View>
          <Pressable onPress={clear} className="px-3 py-1">
            <Text className="text-sm font-medium text-destructive">Xóa</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2">
          <Pressable
            onPress={pickFromCamera}
            disabled={busy}
            className={cn(
              'h-11 flex-row items-center justify-center rounded-lg border border-border',
              busy ? 'bg-muted' : 'bg-card'
            )}
          >
            <Text className="text-base font-medium text-foreground">📷 Chụp ảnh</Text>
          </Pressable>
          <Pressable
            onPress={pickFromGallery}
            disabled={busy}
            className={cn(
              'h-11 flex-row items-center justify-center rounded-lg border border-border',
              busy ? 'bg-muted' : 'bg-card'
            )}
          >
            <Text className="text-base font-medium text-foreground">🖼 Chọn ảnh</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

interface DocumentPickerProps2 {
  label?: string;
  value?: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
}

export const DocFilePicker = memo(function DocFilePicker({
  label,
  value,
  onChange,
}: DocumentPickerProps2) {
  const pick = useCallback(async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (r.canceled || !r.assets?.[0]) return;
      const a = r.assets[0];
      onChange({
        uri: a.uri,
        name: a.name ?? `file-${Date.now()}`,
        type: a.mimeType ?? 'application/octet-stream',
        size: a.size,
      });
    } catch (e: unknown) {
      Alert.alert('Lỗi', (e as { message?: string })?.message ?? 'Không chọn được tài liệu');
    }
  }, [onChange]);

  const clear = useCallback(() => onChange(null), [onChange]);

  return (
    <View>
      {label ? <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text> : null}
      {value ? (
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-3">
          <Text className="flex-1 text-base text-foreground" numberOfLines={1}>
            {value.name}
          </Text>
          <Pressable onPress={clear} className="px-3 py-1">
            <Text className="text-sm font-medium text-destructive">Xóa</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          className="h-11 flex-row items-center justify-center rounded-lg border border-border bg-card"
        >
          <Text className="text-base font-medium text-foreground">📎 Chọn tài liệu</Text>
        </Pressable>
      )}
    </View>
  );
});
