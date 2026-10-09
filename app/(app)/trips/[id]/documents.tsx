/**
 * Trip Documents — upload/view documents attached to a fishing trip.
 * Photos and files are uploaded directly; failures queue upload for later.
 *
 * Uses single-file pickers (PhotoPicker / DocFilePicker). The user picks one
 * file at a time and uploads it immediately. Existing uploads are shown below.
 *
 * The trip overview is the source of truth for the document list. The upload
 * call is a separate request that, on success, refreshes the overview so the
 * list stays consistent with the backend.
 */

import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { RefreshableScroll } from '@/components/ui/RefreshableScroll';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import { InlineEmpty } from '@/components/ui/InlineEmpty';
import { ErrorState } from '@/components/ui/ErrorState';
import { useColors } from '@/src/design-system/use-colors';
import { DocumentCard } from '@/src/components/domain/cards';
import { PhotoPicker, DocFilePicker } from '@/src/components/forms/pickers';
import type { PickedFile } from '@/src/components/forms/pickers';
import { friendlyApiError } from '@/src/lib/error-messages';
import { notify } from '@/src/lib/toast';

import { getTripOverview, uploadDocument } from '@/src/api';
import type { TripDocument } from '@/src/api';

export default function TripDocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useColors();
  const [documents, setDocuments] = React.useState<TripDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<PickedFile | null>(null);

  async function fetch() {
    if (!id) return;
    try {
      setError(null);
      const overview = await getTripOverview(id);
      setDocuments(overview.documents);
    } catch (err: unknown) {
      setError(friendlyApiError((err as { message?: string })?.message));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = React.useCallback(async () => {
    await fetch();
  }, [id]);

  async function handleUpload() {
    if (!id || !pendingFile) return;
    setUploading(true);
    try {
      await uploadDocument(pendingFile, {
        ownerType: 'fishing-trip',
        ownerId: id,
      });
      notify.success('Đã tải lên thành công');
      setPendingFile(null);
      await fetch();
    } catch (err: unknown) {
      notify.error(
        `Tải lên thất bại: ${friendlyApiError((err as { message?: string })?.message)}`
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Tài liệu" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && documents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Tài liệu" />
        <ErrorState
          title="Không thể tải tài liệu"
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScreenHeader title="Tài liệu" />
      <RefreshableScroll
        onRefresh={handleRefresh}
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 py-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 gap-3">
          <Text variant="heading" className="font-semibold">
            Tải lên tài liệu mới
          </Text>
          <PhotoPicker
            label="Ảnh"
            value={pendingFile?.type.startsWith('image/') ? pendingFile : null}
            onChange={(f) => setPendingFile((prev) => (!f || f.type.startsWith('image/')) ? f : prev)}
          />
          <DocFilePicker
            label="Tài liệu"
            value={pendingFile && !pendingFile.type.startsWith('image/') ? pendingFile : null}
            onChange={(f) => setPendingFile((prev) => (f && !f.type.startsWith('image/')) ? f : prev)}
          />

          {pendingFile ? (
            <Button
              size="lg"
              onPress={handleUpload}
              disabled={uploading}
              accessibilityLabel={`Tải lên ${pendingFile.name}`}
              className="w-full"
              style={{ borderCurve: 'continuous', minHeight: 48 }}>
              <Text
                className="font-semibold"
                style={{ color: palette.primaryForeground }}>
                {uploading ? 'Đang tải lên…' : `Tải lên: ${pendingFile.name}`}
              </Text>
            </Button>
          ) : null}
        </View>

        <View>
          <Text variant="heading" className="mb-2 font-semibold">
            Đã tải lên ({documents.length})
          </Text>
          {documents.length === 0 ? (
            <InlineEmpty icon="file-document-outline" message="Chưa có tài liệu nào." />
          ) : (
            <View className="gap-2">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </View>
          )}
        </View>
      </RefreshableScroll>
    </SafeAreaView>
  );
}