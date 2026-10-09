/**
 * Refreshable* — generic pull-to-refresh containers, offline-aware.
 *
 * Exports:
 *  - RefreshableScroll   (ScrollView wrapper with RefreshControl)
 *  - RefreshableFlatList (FlatList wrapper with RefreshControl)
 *
 * Behaviour:
 *  - Online:  standard spinner, calls `onRefresh`, then hides spinner.
 *  - Offline: completes the gesture, shows a friendly inline banner
 *             ("📴 Offline — không thể đồng bộ") and DOES NOT call
 *             `onRefresh`. Cached data on screen stays untouched.
 *
 * Why not call `onRefresh` offline?
 *  Network requests would fail immediately. The user is already informed of
 *  offline status by the OfflineBanner at the top of the screen; doing
 *  another attempt here would be noise (and could clear cached state).
 *
 * Use anywhere a screen should be able to refresh its data with one gesture:
 * trips list, home dashboard, vessels, notifications, trip detail, sync
 * center, etc.
 */

import * as React from 'react';
import {
  FlatList,
  RefreshControl,
  type RefreshControlProps,
  ScrollView,
  View,
  type FlatListProps,
  type ScrollViewProps,
} from 'react-native';

import { cn } from '@/lib/cn';
import { Text } from '@/components/nativewindui/Text';
import { useSyncStore } from '@/src/offline/sync-store';

// ─── Shared refresh handler ──────────────────────────────────────────────

interface UseRefreshableOptions {
  /** Async fetch invoked on pull-to-refresh while online. */
  onRefresh: () => Promise<void> | void;
  /** Light-colored tint for the spinner. */
  tintColor?: string;
}

interface UseRefreshableResult {
  refreshControl: React.ReactElement<RefreshControlProps>;
  refreshing: boolean;
  offlineHint: boolean;
}

function useRefreshable({
  onRefresh,
  tintColor,
}: UseRefreshableOptions): UseRefreshableResult {
  const online = useSyncStore((s) => s.online);
  const [internalRefreshing, setInternalRefreshing] = React.useState(false);
  const [offlineHint, setOfflineHint] = React.useState(false);

  // Always show the OfflineBanner-on-pull UX regardless of the latest
  // cached data state, since the rule is "never call onRefresh offline".
  const handleRefresh = React.useCallback(async () => {
    if (!online) {
      setOfflineHint(true);
      return;
    }

    setInternalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);
    }
  }, [online, onRefresh]);

  const refreshControl = React.useMemo(
    () => (
      <RefreshControl
        refreshing={internalRefreshing}
        onRefresh={handleRefresh}
        tintColor={tintColor}
        colors={tintColor ? [tintColor] : undefined}
      />
    ),
    [internalRefreshing, handleRefresh, tintColor]
  );

  return { refreshControl, refreshing: internalRefreshing, offlineHint };
}

// ─── Offline hint banner (inline, shown above scrollable content) ────────

function OfflineHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View className="mx-4 mt-3 rounded-lg bg-slate-200 px-3 py-2">
      <Text className="text-sm font-medium text-slate-800">
        📴 Offline — không thể đồng bộ
      </Text>
      <Text className={cn('mt-0.5 text-xs text-slate-700')}>
        Dữ liệu hiển thị là bản lưu trên thiết bị. Kéo để thử lại khi có mạng.
      </Text>
    </View>
  );
}

// ─── RefreshableScroll ──────────────────────────────────────────────────

export interface RefreshableScrollProps
  extends Omit<ScrollViewProps, 'refreshControl' | 'children'> {
  onRefresh: () => Promise<void> | void;
  tintColor?: string;
  children?: React.ReactNode;
}

export function RefreshableScroll({
  onRefresh,
  tintColor,
  className,
  contentContainerClassName,
  children,
  ...rest
}: RefreshableScrollProps) {
  const { refreshControl, offlineHint } = useRefreshable({ onRefresh, tintColor });

  return (
    <ScrollView
      className={className}
      contentContainerClassName={contentContainerClassName}
      refreshControl={refreshControl}
      {...rest}>
      <OfflineHint visible={offlineHint} />
      {children}
    </ScrollView>
  );
}

// ─── RefreshableFlatList ─────────────────────────────────────────────────

/**
 * Drop-in RefreshControl wrapper around FlatList with offline-safe behaviour.
 * Pass the full FlatList props (including `data` / `renderItem` / `keyExtractor`).
 */
export interface RefreshableFlatListProps<T>
  extends Omit<FlatListProps<T>, 'refreshControl'> {
  onRefresh: () => Promise<void> | void;
  tintColor?: string;
}

export function RefreshableFlatList<T>(props: RefreshableFlatListProps<T>) {
  const {
    onRefresh,
    tintColor,
    className,
    contentContainerClassName,
    ListHeaderComponent,
    ...rest
  } = props;

  const { refreshControl, offlineHint } = useRefreshable({ onRefresh, tintColor });

  return (
    <FlatList
      className={className}
      contentContainerClassName={contentContainerClassName}
      refreshControl={refreshControl}
      ListHeaderComponent={
        <>
          <OfflineHint visible={offlineHint} />
          {ListHeaderComponent as React.ReactElement}
        </>
      }
      {...rest}
    />
  );
}
