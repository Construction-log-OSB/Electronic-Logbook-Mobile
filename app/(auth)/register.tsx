/**
 * Register Screen — SATURN Electronic Logbook Mobile App
 *
 * Maritime palette, semantic tokens. Touch targets ≥ 44pt.
 * Identifier type is a reusable SegmentedControl (Email | Phone).
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextInput } from '@/src/components/nativewindui/TextInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ScreenPadding, Spacing } from '@/src/design-system/tokens';

import { useAuthStore } from '@/src/auth/store/auth.store';
import { IdentifierType } from '@/src/auth/types';

const IDENTIFIER_OPTIONS: { value: IdentifierType; label: string }[] = [
  { value: IdentifierType.EMAIL, label: 'Email' },
  { value: IdentifierType.PHONE, label: 'Số điện thoại' },
];

export default function RegisterScreen() {
  const router = useRouter();

  const { register, error, clearError } = useAuthStore();

  const [identifierType, setIdentifierType] = React.useState<IdentifierType>(IdentifierType.EMAIL);
  const [identifier, setIdentifier] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<{
    identifier?: string;
    fullName?: string;
  }>({});

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    }
    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    clearError();
    setFieldErrors({});

    if (!validateForm()) return;

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      await register({
        identifierType,
        identifier: identifier.trim(),
        fullName: fullName.trim(),
      });
      router.replace('/login');
    } catch {
      // Error set in store
    } finally {
      setSubmitting(false);
    }
  }

  function handleIdentifierTypeChange(newType: IdentifierType) {
    setIdentifierType(newType);
    setIdentifier('');
    clearError();
    setFieldErrors({});
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            className="flex-1"
            showsVerticalScrollIndicator={false}>
            <View
              className="flex-1 gap-5"
              style={{
                paddingHorizontal: ScreenPadding.horizontal,
                paddingVertical: Spacing.lg,
              }}>
              {/* Header */}
              <View className="items-center gap-2">
                <Text variant="title1" className="text-center font-semibold">
                  Tạo tài khoản
                </Text>
                <Text variant="subhead" className="text-center text-muted-foreground">
                  Đăng ký để sử dụng Nhật ký điện tử
                </Text>
              </View>

              <SegmentedControl
                options={IDENTIFIER_OPTIONS}
                value={identifierType}
                onChange={handleIdentifierTypeChange}
              />

              {/* Form */}
              <View className="gap-4">
                <TextInput>
                  <TextInput.Label>Họ tên</TextInput.Label>
                  <TextInput.Input
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    placeholder="Nguyễn Văn A"
                    autoCapitalize="words"
                    autoCorrect={false}
                    error={!!fieldErrors.fullName}
                    disabled={submitting}
                  />
                  {fieldErrors.fullName ? (
                    <TextInput.Error>{fieldErrors.fullName}</TextInput.Error>
                  ) : null}
                </TextInput>

                <TextInput>
                  <TextInput.Label>
                    {identifierType === IdentifierType.EMAIL ? 'Email' : 'Số điện thoại'}
                  </TextInput.Label>
                  <TextInput.Input
                    value={identifier}
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (fieldErrors.identifier) {
                        setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                      }
                    }}
                    placeholder={
                      identifierType === IdentifierType.EMAIL
                        ? 'nguyenvana@example.com'
                        : '0901234567'
                    }
                    keyboardType={
                      identifierType === IdentifierType.EMAIL ? 'email-address' : 'phone-pad'
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={!!fieldErrors.identifier}
                    disabled={submitting}
                  />
                  {fieldErrors.identifier ? (
                    <TextInput.Error>{fieldErrors.identifier}</TextInput.Error>
                  ) : null}
                </TextInput>
              </View>

              {error ? (
                <View className="border-destructive/30 bg-destructive/10 rounded-xl border p-3">
                  <Text variant="footnote" className="text-destructive">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="rounded-xl bg-muted p-3">
                <Text variant="footnote" className="text-muted-foreground">
                  Mật khẩu sẽ được gửi đến{' '}
                  {identifierType === IdentifierType.EMAIL ? 'email' : 'số điện thoại'} của bạn
                  sau khi đăng ký.
                </Text>
              </View>

              <Button
                size="lg"
                onPress={handleRegister}
                disabled={submitting}
                className="w-full"
                style={{ borderCurve: 'continuous' }}>
                {submitting ? (
                  <ActivityIndicator color="rgb(var(--primary-foreground))" />
                ) : (
                  <Text className="font-semibold text-primary-foreground">Đăng ký</Text>
                )}
              </Button>

              <View
                className="flex-row items-center justify-center gap-1"
                style={{ paddingTop: Spacing.xs }}
              >
                <Text variant="subhead" className="text-muted-foreground">
                  Đã có tài khoản?
                </Text>
                <Text
                  variant="subhead"
                  className="font-semibold text-primary"
                  onPress={() => !submitting && router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại đăng nhập">
                  Đăng nhập
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
