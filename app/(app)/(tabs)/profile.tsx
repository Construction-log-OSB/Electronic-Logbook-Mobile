/**
 * Profile Tab — user account info, settings, and logout.
 *
 * No raw UUID / database ID is exposed.
 * Palette tokens, semantic colors, 48pt primary action.
 */

import { Alert, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { InfoRow } from '@/components/ui/InfoRow';
import { useColors } from '@/src/design-system/use-colors';

import { useAuthStore } from '@/src/auth/store/auth.store';

export default function ProfileScreen() {
  const { account, logout, status } = useAuthStore();
  const palette = useColors();
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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 py-4 pb-8">
        {/* Profile Header */}
        <View className="items-center gap-3 py-6">
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 80,
              height: 80,
              backgroundColor: palette.primary,
            }}>
            <Text
              className="text-3xl font-bold"
              style={{ color: palette.primaryForeground }}>
              {account?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text variant="title2" className="font-bold">
              {account?.fullName ?? 'Người dùng'}
            </Text>
            <Text variant="subhead" className="text-muted-foreground">
              {account?.identifier ?? ''}
            </Text>
          </View>
        </View>

        {/* Account Info */}
        <Card className="mb-4">
          <View className="gap-3">
            <Text variant="heading" className="font-semibold">Thông tin tài khoản</Text>
            <InfoRow
              icon="card-account-details"
              label="Loại tài khoản"
              value={formatAccountType(account?.accountType)}
            />
            <InfoRow
              icon="check-circle"
              label="Trạng thái"
              value={formatAccountStatus(account?.status)}
            />
          </View>
        </Card>

        {/* Quick Info */}
        <Card className="mb-4">
          <View className="gap-3">
            <Text variant="heading" className="font-semibold">Thông tin khác</Text>
            <InfoRow
              icon="information"
              label="Định danh"
              value={
                account?.identifierType
                  ? `${identifierLabel(account.identifierType)}: ${account.identifier}`
                  : '—'
              }
            />
          </View>
        </Card>

        {/* App Info */}
        <Card className="mb-4">
          <View className="gap-3">
            <Text variant="heading" className="font-semibold">Ứng dụng</Text>
            <InfoRow icon="information" label="Phiên bản" value="1.0.0" />
            <InfoRow icon="api" label="API Gateway" value="v1.0" />
          </View>
        </Card>

        {/* Logout */}
        <Button
          variant="secondary"
          size="lg"
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityLabel="Đăng xuất khỏi ứng dụng"
          className="w-full"
          style={{
            borderCurve: 'continuous',
            minHeight: 48,
          }}>
          <MaterialCommunityIcons name="logout" size={20} color={palette.danger} />
          <Text
            className="font-semibold"
            style={{ color: palette.danger }}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatAccountType(type?: string): string {
  if (!type) return '—';
  const map: Record<string, string> = {
    FISHERMAN: 'Ngư dân',
    VESSEL_OWNER: 'Chủ tàu',
    ADMIN: 'Quản trị',
    OBSERVER: 'Giám sát',
  };
  return map[type] ?? type;
}

function formatAccountStatus(status?: string): string {
  if (!status) return '—';
  const map: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
    SUSPENDED: 'Tạm khóa',
    PENDING: 'Chờ xác thực',
  };
  return map[status] ?? status;
}

function identifierLabel(type: string): string {
  const map: Record<string, string> = {
    EMAIL: 'Email',
    PHONE: 'Số điện thoại',
  };
  return map[type] ?? type;
}