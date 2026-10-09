/**
 * GPSInput — auto-fetch device location with a manual override.
 *
 * Uses expo-location. Always shows the actual coordinate values once
 * captured. Falls back to allowing manual entry when permission is denied
 * or GPS is unavailable.
 */

import React, { memo, useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { cn } from '@/lib/cn';
import { RequiredLabel, ValidationMessage, NumericInput } from './primitives';

interface GPSInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

export const GPSInput = memo(function GPSInput({
  label,
  required,
  error,
  hint,
  latitude,
  longitude,
  onChange,
}: GPSInputProps) {
  const [fetching, setFetching] = useState(false);
  const [gpsHint, setGpsHint] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setFetching(true);
      setGpsHint(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsHint(
          'Không có quyền truy cập vị trí. Vui lòng cấp quyền trong cài đặt hoặc nhập thủ công.'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      onChange(pos.coords.latitude, pos.coords.longitude);
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ?? 'Không lấy được vị trí';
      Alert.alert('Lỗi vị trí', msg);
      setGpsHint('Không lấy được vị trí. Vui lòng thử lại hoặc nhập thủ công.');
    } finally {
      setFetching(false);
    }
  }, [onChange]);

  return (
    <View>
      {label ? <RequiredLabel required={required}>{label}</RequiredLabel> : null}
      <View className="gap-2 rounded-lg border border-border bg-card p-3">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <NumericInput
              value={latitude === null ? '' : String(latitude)}
              onChangeText={(v) => onChange(v ? parseFloat(v) : null, longitude)}
              placeholder="Vĩ độ"
              allowDecimal
              minValue={-90}
              maxValue={90}
            />
          </View>
          <View className="flex-1">
            <NumericInput
              value={longitude === null ? '' : String(longitude)}
              onChangeText={(v) => onChange(latitude, v ? parseFloat(v) : null)}
              placeholder="Kinh độ"
              allowDecimal
              minValue={-180}
              maxValue={180}
            />
          </View>
        </View>
        <Pressable
          onPress={fetch}
          disabled={fetching}
          className={cn(
            'h-10 flex-row items-center justify-center rounded-md',
            fetching ? 'bg-muted' : 'bg-primary'
          )}
        >
          <Text
            className={cn(
              'text-sm font-semibold',
              fetching ? 'text-muted-foreground' : 'text-primary-foreground'
            )}
          >
            {fetching ? 'Đang lấy vị trí…' : '📍 Lấy vị trí hiện tại'}
          </Text>
        </Pressable>
      </View>
      <ValidationMessage
        message={error ?? gpsHint ?? hint}
        variant={error || gpsHint ? 'error' : 'hint'}
      />
    </View>
  );
});
