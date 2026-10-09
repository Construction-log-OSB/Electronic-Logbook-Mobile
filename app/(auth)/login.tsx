/**
 * Login Screen — SATURN Electronic Logbook Mobile App
 *
 * Maritime palette, semantic tokens. Touch targets ≥ 44pt.
 * No hardcoded device dimensions. Safe area via SafeAreaView.
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

import { Brand } from '@/components/ui/Brand';
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

export default function LoginScreen() {
  const router = useRouter();

  const { login, status, error, clearError } = useAuthStore();

  const [identifierType, setIdentifierType] = React.useState<IdentifierType>(IdentifierType.EMAIL);
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{
    identifier?: string;
    password?: string;
  }>({});

  const isLoading = status === 'authenticating';

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    }
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    clearError();
    setFieldErrors({});

    if (!validateForm()) return;

    Keyboard.dismiss();

    try {
      await login({
        identifierType,
        identifier: identifier.trim(),
        password,
      });
    } catch {
      // Error is already set in store by login()
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
              className="flex-1 gap-6"
              style={{
                paddingHorizontal: ScreenPadding.horizontal,
                paddingVertical: Spacing.xxl,
              }}>
              {/* Header with Brand */}
              <View className="items-center gap-4" style={{ paddingTop: Spacing.xl }}>
                <Brand size="large" />
                <View className="items-center gap-1">
                  <Text variant="subhead" className="text-center text-muted-foreground">
                    Đăng nhập để tiếp tục
                  </Text>
                </View>
              </View>

              {/* Identifier Type Selector — accessible segmented control */}
              <SegmentedControl
                options={IDENTIFIER_OPTIONS}
                value={identifierType}
                onChange={handleIdentifierTypeChange}
              />

              {/* Form */}
              <View className="gap-4">
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
                    autoComplete="username"
                    error={!!fieldErrors.identifier}
                    disabled={isLoading}
                  />
                  {fieldErrors.identifier ? (
                    <TextInput.Error>{fieldErrors.identifier}</TextInput.Error>
                  ) : null}
                </TextInput>

                <TextInput>
                  <TextInput.Label>Mật khẩu</TextInput.Label>
                  <TextInput.PasswordInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="Nhập mật khẩu"
                    error={!!fieldErrors.password}
                    disabled={isLoading}
                  />
                  {fieldErrors.password ? (
                    <TextInput.Error>{fieldErrors.password}</TextInput.Error>
                  ) : null}
                </TextInput>
              </View>

              {/* Global error */}
              {error ? (
                <View className="border-destructive/30 bg-destructive/10 rounded-xl border p-3">
                  <Text variant="footnote" className="text-destructive">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Submit */}
              <View className="gap-3">
                <Button
                  size="lg"
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="w-full"
                  style={{ borderCurve: 'continuous' }}>
                  {isLoading ? (
                    <ActivityIndicator color="rgb(var(--primary-foreground))" />
                  ) : (
                    <Text className="font-semibold text-primary-foreground">Đăng nhập</Text>
                  )}
                </Button>

                <View className="items-center" style={{ paddingVertical: Spacing.xs }}>
                  <Text
                    variant="subhead"
                    className="text-muted-foreground"
                    onPress={() => !isLoading && router.push('/forgot-password')}
                    accessibilityRole="button"
                    accessibilityLabel="Quên mật khẩu">
                    Quên mật khẩu?
                  </Text>
                </View>
              </View>

              {/* Register link */}
              <View
                className="flex-row items-center justify-center gap-1"
                style={{ paddingTop: Spacing.md }}
              >
                <Text variant="subhead" className="text-muted-foreground">
                  Chưa có tài khoản?
                </Text>
                <Text
                  variant="subhead"
                  className="font-semibold text-primary"
                  onPress={() => !isLoading && router.push('/register')}
                  accessibilityRole="button"
                  accessibilityLabel="Đăng ký tài khoản mới">
                  Đăng ký
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
