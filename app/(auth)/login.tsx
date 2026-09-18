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

import { useColorScheme } from '@/lib/useColorScheme';

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextInput } from '@/src/components/nativewindui/TextInput';

import { useAuthStore } from '@/src/auth/store/auth.store';
import { IdentifierType } from '@/src/auth/types';

export default function LoginScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      // Navigation happens via _layout.tsx observing auth status
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

  const primaryColor = isDark ? '#3B82F6' : '#007AFE'; // primary from theme

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            className="flex-1">
            <View className="flex-1 gap-6 px-6 py-12">
              {/* Header */}
              <View className="items-center gap-4 pt-8">
                <View
                  className="h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: primaryColor }}>
                  <Text className="text-3xl font-bold text-white">OSB</Text>
                </View>
                <View className="items-center gap-1">
                  <Text variant="title1" className="text-center font-semibold">
                    Nhật ký điện tử
                  </Text>
                  <Text variant="subhead" color="secondary" className="text-center">
                    Đăng nhập để tiếp tục
                  </Text>
                </View>
              </View>

              {/* Identifier Type Selector */}
              <View
                className="flex-row rounded-full p-1"
                style={{ backgroundColor: isDark ? '#212225' : '#F0F0F3' }}>
                <Pressable
                  className="flex-1 items-center rounded-full py-2.5"
                  style={
                    identifierType === IdentifierType.EMAIL
                      ? { backgroundColor: isDark ? '#2E3135' : '#fff' }
                      : undefined
                  }
                  onPress={() => handleIdentifierTypeChange(IdentifierType.EMAIL)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: identifierType === IdentifierType.EMAIL }}>
                  <Text
                    variant="subhead"
                    className={
                      identifierType === IdentifierType.EMAIL ? 'font-semibold' : undefined
                    }>
                    Email
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-full py-2.5"
                  style={
                    identifierType === IdentifierType.PHONE
                      ? { backgroundColor: isDark ? '#2E3135' : '#fff' }
                      : undefined
                  }
                  onPress={() => handleIdentifierTypeChange(IdentifierType.PHONE)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: identifierType === IdentifierType.PHONE }}>
                  <Text
                    variant="subhead"
                    className={
                      identifierType === IdentifierType.PHONE ? 'font-semibold' : undefined
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
                <Button size="lg" onPress={handleLogin} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-semibold text-white">Đăng nhập</Text>
                  )}
                </Button>

                <Pressable
                  className="items-center py-2"
                  onPress={() => router.push('/forgot-password')}
                  disabled={isLoading}
                  accessibilityRole="button">
                  <Text variant="subhead" color="secondary">
                    Quên mật khẩu?
                  </Text>
                </Pressable>
              </View>

              {/* Register link */}
              <View className="flex-row items-center justify-center gap-1 pt-4">
                <Text variant="subhead" color="secondary">
                  Chưa có tài khoản?
                </Text>
                <Pressable
                  onPress={() => router.push('/register')}
                  disabled={isLoading}
                  accessibilityRole="button">
                  <Text variant="subhead" className="font-semibold" style={{ color: primaryColor }}>
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
