/**
 * Home Screen — shown after successful authentication.
 * Demonstrates authenticated state + logout.
 */

import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/lib/useColorScheme';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { account, logout, status } = useAuthStore();
  const isLoggingOut = status === 'logging_out';

  function handleLogout() {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        contentContainerClassName="px-6 py-8">
        <View className="flex-1 gap-6">
          {/* Welcome */}
          <View className="gap-2">
            <Text variant="title1" className="font-semibold">
              Xin chào!
            </Text>
            {account?.fullName ? (
              <Text variant="title3" color="secondary">
                {account.fullName}
              </Text>
            ) : (
              <Text variant="title3" color="secondary">
                {account?.identifier ?? ''}
              </Text>
            )}
          </View>

          {/* Account Info Card */}
          <View
            className="gap-2 rounded-2xl border p-4"
            style={{
              backgroundColor: isDark ? '#212225' : '#F8F9FA',
              borderColor: isDark ? '#2E3135' : '#E5E7EB',
            }}>
            <Text variant="caption2" color="secondary" className="uppercase">
              Thông tin tài khoản
            </Text>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text variant="footnote" color="secondary">
                  ID
                </Text>
                <Text variant="footnote">{account?.id ?? '—'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text variant="footnote" color="secondary">
                  Loại
                </Text>
                <Text variant="footnote">{account?.accountType ?? '—'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text variant="footnote" color="secondary">
                  Trạng thái
                </Text>
                <Text variant="footnote">{account?.status ?? '—'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text variant="footnote" color="secondary">
                  Identifier
                </Text>
                <Text variant="footnote">{account?.identifier ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* Placeholder for business modules */}
          <View
            className="gap-2 rounded-2xl border p-6"
            style={{
              backgroundColor: isDark ? '#212225' : '#F8F9FA',
              borderColor: isDark ? '#2E3135' : '#E5E7EB',
            }}>
            <Text variant="title3" className="font-semibold">
              Nhật ký điện tử
            </Text>
            <Text variant="body" color="secondary">
              Authentication đã hoạt động. Các business modules (vessels, fishing-trips, logbook,
              documents) sẽ được tích hợp tại đây.
            </Text>
          </View>

          {/* Logout */}
          <Button
            variant="secondary"
            size="lg"
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="w-full">
            <Text className="font-semibold">Đăng xuất</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
