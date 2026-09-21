import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

import { useAuthStore } from '@/src/auth/store/auth.store';

export default function HomeScreen() {
  const { account, logout, status } = useAuthStore();
  const isLoggingOut = status === 'logging_out';

  function handleLogout() {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        {
          text: 'Huỷ',
          style: 'cancel',
        },
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 py-6">
        <View className="flex-1 gap-6">
          {/* Welcome */}
          <View className="gap-2">
            <Text variant="title1" className="font-semibold">
              Xin chào!
            </Text>
            {account?.fullName ? (
              <Text variant="title3" className="text-muted-foreground">
                {account.fullName}
              </Text>
            ) : (
              <Text variant="title3" className="text-muted-foreground">
                {account?.identifier ?? ''}
              </Text>
            )}
          </View>

          {/* Account Info Card */}
          <Card>
            <View className="gap-2">
              <Text variant="caption1" className="uppercase text-muted-foreground">
                Thông tin tài khoản
              </Text>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text variant="footnote" className="text-muted-foreground">
                    ID
                  </Text>
                  <Text variant="footnote">{account?.id ?? '—'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text variant="footnote" className="text-muted-foreground">
                    Loại tài khoản
                  </Text>
                  <Text variant="footnote">{account?.accountType ?? '—'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text variant="footnote" className="text-muted-foreground">
                    Trạng thái
                  </Text>
                  <Text variant="footnote">{account?.status ?? '—'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text variant="footnote" className="text-muted-foreground">
                    Email/SĐT
                  </Text>
                  <Text variant="footnote" className="max-w-[60%] text-right">
                    {account?.identifier ?? '—'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Placeholder for business modules */}
          <Card>
            <View className="gap-3">
              <Text variant="title3" className="font-semibold">
                Nhật ký điện tử
              </Text>
              <Text variant="body" className="text-muted-foreground">
                Chào mừng bạn đến với ứng dụng Nhật ký điện tử OSB. Các tính năng nghiệp vụ sẽ được
                phát triển trong các phiên bản tiếp theo.
              </Text>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card>
            <View className="gap-3">
              <Text variant="title3" className="font-semibold">
                Thao tác nhanh
              </Text>
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="body" className="text-muted-foreground">
                    Phiên bản ứng dụng
                  </Text>
                  <Text variant="footnote">1.0.0</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Logout */}
          <Button
            variant="secondary"
            size="lg"
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="w-full"
            style={{ borderCurve: 'continuous' }}>
            <Text className="font-semibold">Đăng xuất</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
