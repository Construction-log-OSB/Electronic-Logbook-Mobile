/**
 * Login Screen — SATURN Electronic Logbook Mobile App
 *
 * Design: NativewindUI + Tailwind, mobile-first.
 * Auth state managed via useAuthStore.
 * Boot flow handled in app/_layout.tsx (hydration before render).
 */

import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

import { useAuthStore } from '@/src/auth/store/auth.store';
import { IdentifierType } from '@/src/auth/types';

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
            <View className="flex-1 gap-6 px-6 py-12">
              {/* Header with Brand */}
              <View className="items-center gap-4 pt-8">
                <Brand size="large" />
                <View className="items-center gap-1">
                  <Text variant="subhead" className="text-center text-muted-foreground">
                    Đăng nhập để tiếp tục
                  </Text>
                </View>
              </View>

              {/* Identifier Type Selector */}
              <View className="flex-row rounded-full bg-muted p-1">
                <Pressable
                  className="flex-1 items-center rounded-full py-2.5"
                  style={
                    identifierType === IdentifierType.EMAIL
                      ? { backgroundColor: 'rgb(var(--card))' }
                      : undefined
                  }
                  onPress={() => handleIdentifierTypeChange(IdentifierType.EMAIL)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: identifierType === IdentifierType.EMAIL }}>
                  <Text
                    variant="subhead"
                    className={
                      identifierType === IdentifierType.EMAIL
                        ? 'font-semibold'
                        : 'text-muted-foreground'
                    }>
                    Email
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-full py-2.5"
                  style={
                    identifierType === IdentifierType.PHONE
                      ? { backgroundColor: 'rgb(var(--card))' }
                      : undefined
                  }
                  onPress={() => handleIdentifierTypeChange(IdentifierType.PHONE)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: identifierType === IdentifierType.PHONE }}>
                  <Text
                    variant="subhead"
                    className={
                      identifierType === IdentifierType.PHONE
                        ? 'font-semibold'
                        : 'text-muted-foreground'
                    }>
                    Số điện thoại
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View className="gap-4">
                {/* Identifier */}
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

                {/* Password */}
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

                <Pressable
                  className="items-center py-2"
                  onPress={() => router.push('/forgot-password')}
                  disabled={isLoading}
                  accessibilityRole="button">
                  <Text variant="subhead" className="text-muted-foreground">
                    Quên mật khẩu?
                  </Text>
                </Pressable>
              </View>

              {/* Register link */}
              <View className="flex-row items-center justify-center gap-1 pt-4">
                <Text variant="subhead" className="text-muted-foreground">
                  Chưa có tài khoản?
                </Text>
                <Pressable
                  onPress={() => router.push('/register')}
                  disabled={isLoading}
                  accessibilityRole="button">
                  <Text variant="subhead" className="font-semibold text-primary">
                    Đăng ký
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
