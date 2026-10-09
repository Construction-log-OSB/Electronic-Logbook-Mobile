/**
 * CatchItemForm — repeatable single catch row.
 *
 * Keeps a string-typed `quantity` so the user can clear the field without
 * losing focus / numeric coercion. Submits numeric value on parent.
 */

import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppInput, NumericInput } from '@/src/components/forms/primitives';
import { BottomSheetSelect } from '@/src/components/forms/bottom-sheet-select';

export interface CatchDraft {
  speciesName: string;
  quantity: string;
  unit: string;
  condition: string;
}

interface CatchItemFormProps {
  value: CatchDraft;
  onChange: (patch: Partial<CatchDraft>) => void;
  onRemove: () => void;
}

const UNIT_OPTIONS = [
  { label: 'kg', value: 'kg' },
  { label: 'tạ (100kg)', value: 'QUINTAL' },
  { label: 'tấn', value: 'TON' },
  { label: 'con', value: 'PIECE' },
];

const CONDITION_OPTIONS = [
  { label: 'Tươi sống', value: 'FRESH' },
  { label: 'Ủ đá', value: 'ICED' },
  { label: 'Đông lạnh', value: 'FROZEN' },
  { label: 'Sơ chế', value: 'PROCESSED' },
];

export const CatchItemForm = memo(function CatchItemForm({
  value,
  onChange,
  onRemove,
}: CatchItemFormProps) {
  return (
    <View className="rounded-lg border border-border bg-card p-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">Sản phẩm khai thác</Text>
        <Pressable onPress={onRemove} hitSlop={10} className="px-2">
          <Text className="text-sm text-destructive">Xoá</Text>
        </Pressable>
      </View>
      <AppInput
        label="Loài thuỷ sản"
        required
        value={value.speciesName}
        onChangeText={(v) => onChange({ speciesName: v })}
        placeholder="VD: Cá ngừ đại dương"
      />
      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <NumericInput
            label="Khối lượng"
            required
            allowDecimal
            minValue={0}
            value={value.quantity}
            onChangeText={(v) => onChange({ quantity: v })}
            placeholder="0"
          />
        </View>
        <View className="w-32">
          <BottomSheetSelect
            label="Đơn vị"
            value={value.unit || 'kg'}
            onChange={(v) => onChange({ unit: String(v) })}
            options={UNIT_OPTIONS}
          />
        </View>
      </View>
      <View className="mt-2">
        <BottomSheetSelect
          label="Tình trạng"
          value={value.condition || null}
          onChange={(v) => onChange({ condition: String(v) })}
          options={CONDITION_OPTIONS}
          placeholder="Chọn tình trạng"
        />
      </View>
    </View>
  );
});
