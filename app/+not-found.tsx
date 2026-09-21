import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy', headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Text variant="largeTitle" className="font-bold">
            404
          </Text>
          <Text variant="title2" className="text-center font-semibold">
            Trang không tồn tại
          </Text>
          <Text variant="body" className="text-center text-muted-foreground">
            Trang bạn đang tìm kiếm không có hoặc đã được di chuyển.
          </Text>
          <Link href="/(auth)/login" asChild>
            <Button size="lg" className="w-full" style={{ borderCurve: 'continuous' }}>
              <Text className="font-semibold text-primary-foreground">Về trang đăng nhập</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
