/**
 * Forgot Password Screen — SATURN Electronic Logbook Mobile App
 *
 * Two-step flow:
 * 1. Request OTP (forgot-password)
 * 2. Reset password with OTP (reset-password)
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

type Step = 'request' | 'verify' | 'success';

const IDENTIFIER_OPTIONS: { value: IdentifierType; label: string }[] = [
  { value: IdentifierType.EMAIL, label: 'Email' },
  { value: IdentifierType.PHONE, label: 'Số điện thoại' },
];

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { forgotPassword, resetPassword } = useAuthStore();

  const [step, setStep] = React.useState<Step>('request');
  const [identifierType, setIdentifierType] = React.useState<IdentifierType>(IdentifierType.EMAIL);
  const [identifier, setIdentifier] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  function clearErrors() {
    setErrorMessage(null);
    setFieldErrors({});
  }

  async function handleRequestOtp() {
    clearErrors();
    const errors: Record<string, string> = {};
    if (!identifier.trim()) errors.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await forgotPassword({
        identifierType,
        identifier: identifier.trim(),
      });
      setStep('verify');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    clearErrors();
    const errors: Record<string, string> = {};
    if (!otp.trim()) errors.otp = 'Vui lòng nhập mã OTP.';
    if (otp.trim().length < 6) errors.otp = 'Mã OTP phải có ít nhất 6 ký tự.';
    if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    if (newPassword.length < 8) errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự.';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await resetPassword({
        identifierType,
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-3xl font-bold text-primary-foreground">✓</Text>
          </View>
          <Text variant="title2" className="text-center font-semibold">
            Đặt lại mật khẩu thành công
          </Text>
          <Text variant="subhead" className="text-center text-muted-foreground">
            Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.
          </Text>
          <Button
            size="lg"
            onPress={() => router.replace('/login')}
            className="mt-4 w-full"
            style={{ borderCurve: 'continuous' }}>
            <Text className="font-semibold text-primary-foreground">Về trang đăng nhập</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
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
                  {step === 'request' ? 'Quên mật khẩu' : 'Xác thực OTP'}
                </Text>
                <Text variant="subhead" className="text-center text-muted-foreground">
                  {step === 'request'
                    ? 'Chúng tôi sẽ gửi mã xác thực đến bạn'
                    : 'Nhập mã OTP đã được gửi đến bạn'}
                </Text>
              </View>

              <SegmentedControl
                options={IDENTIFIER_OPTIONS}
                value={identifierType}
                onChange={(newType) => {
                  setIdentifierType(newType);
                  setIdentifier('');
                  clearErrors();
                }}
                disabled={step === 'verify' || submitting}
              />

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
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.identifier;
                          return next;
                        });
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
                    editable={step === 'request'}
                    error={!!fieldErrors.identifier}
                    disabled={submitting}
                  />
                  {fieldErrors.identifier ? (
                    <TextInput.Error>{fieldErrors.identifier}</TextInput.Error>
                  ) : null}
                </TextInput>

                {step === 'verify' ? (
                  <>
                    {/* OTP */}
                    <TextInput>
                      <TextInput.Label>Mã OTP</TextInput.Label>
                      <TextInput.Input
                        value={otp}
                        onChangeText={(text) => {
                          setOtp(text);
                          if (fieldErrors.otp) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.otp;
                              return next;
                            });
                          }
                        }}
                        placeholder="Nhập mã OTP 6 số"
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        maxLength={6}
                        error={!!fieldErrors.otp}
                        disabled={submitting}
                      />
                      {fieldErrors.otp ? (
                        <TextInput.Error>{fieldErrors.otp}</TextInput.Error>
                      ) : null}
                    </TextInput>

                    {/* New Password */}
                    <TextInput>
                      <TextInput.Label>Mật khẩu mới</TextInput.Label>
                      <TextInput.PasswordInput
                        value={newPassword}
                        onChangeText={(text) => {
                          setNewPassword(text);
                          if (fieldErrors.newPassword) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.newPassword;
                              return next;
                            });
                          }
                        }}
                        placeholder="Tối thiểu 8 ký tự"
                        error={!!fieldErrors.newPassword}
                        disabled={submitting}
                      />
                      {fieldErrors.newPassword ? (
                        <TextInput.Error>{fieldErrors.newPassword}</TextInput.Error>
                      ) : null}
                    </TextInput>

                    {/* Confirm Password */}
                    <TextInput>
                      <TextInput.Label>Xác nhận mật khẩu</TextInput.Label>
                      <TextInput.PasswordInput
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (fieldErrors.confirmPassword) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.confirmPassword;
                              return next;
                            });
                          }
                        }}
                        placeholder="Nhập lại mật khẩu"
                        error={!!fieldErrors.confirmPassword}
                        disabled={submitting}
                      />
                      {fieldErrors.confirmPassword ? (
                        <TextInput.Error>{fieldErrors.confirmPassword}</TextInput.Error>
                      ) : null}
                    </TextInput>
                  </>
                ) : null}
              </View>

              {/* Global error */}
              {errorMessage ? (
                <View className="border-destructive/30 bg-destructive/10 rounded-xl border p-3">
                  <Text variant="footnote" className="text-destructive">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Submit */}
              <Button
                size="lg"
                onPress={step === 'request' ? handleRequestOtp : handleResetPassword}
                disabled={submitting}
                className="w-full"
                style={{ borderCurve: 'continuous' }}>
                {submitting ? (
                  <ActivityIndicator color="rgb(var(--primary-foreground))" />
                ) : (
                  <Text className="font-semibold text-primary-foreground">
                    {step === 'request' ? 'Gửi mã OTP' : 'Đặt lại mật khẩu'}
                  </Text>
                )}
              </Button>

              {/* Back to login */}
              <View
                className="flex-row items-center justify-center gap-1"
                style={{ paddingTop: Spacing.xs }}
              >
                <Text
                  variant="subhead"
                  className="font-semibold text-primary"
                  onPress={() => !submitting && router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại đăng nhập">
                  ← Quay lại đăng nhập
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
