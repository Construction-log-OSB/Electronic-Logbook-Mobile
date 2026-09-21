/**
 * Register Screen — SATURN Electronic Logbook Mobile App
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

import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextInput } from '@/src/components/nativewindui/TextInput';

import { useAuthStore } from '@/src/auth/store/auth.store';
import { IdentifierType } from '@/src/auth/types';

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
      // Navigate to login after successful registration
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
            <View className="flex-1 gap-5 px-6 py-8">
              {/* Header */}
              <View className="items-center gap-2">
                <Text variant="title1" className="text-center font-semibold">
                  Tạo tài khoản
                </Text>
                <Text variant="subhead" className="text-center text-muted-foreground">
                  Đăng ký để sử dụng Nhật ký điện tử
                </Text>
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
                {/* Full Name */}
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
                    error={!!fieldErrors.identifier}
                    disabled={submitting}
                  />
                  {fieldErrors.identifier ? (
                    <TextInput.Error>{fieldErrors.identifier}</TextInput.Error>
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

              {/* Info */}
              <View className="rounded-xl bg-muted p-3">
                <Text variant="footnote" className="text-muted-foreground">
                  Mật khẩu sẽ được gửi đến{' '}
                  {identifierType === IdentifierType.EMAIL ? 'email' : 'số điện thoại'} của bạn sau
                  khi đăng ký.
                </Text>
              </View>

              {/* Submit */}
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

              {/* Back to login */}
              <View className="flex-row items-center justify-center gap-1 pt-2">
                <Text variant="subhead" className="text-muted-foreground">
                  Đã có tài khoản?
                </Text>
                <Pressable
                  onPress={() => router.back()}
                  disabled={submitting}
                  accessibilityRole="button">
                  <Text variant="subhead" className="font-semibold text-primary">
                    Đăng nhập
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
