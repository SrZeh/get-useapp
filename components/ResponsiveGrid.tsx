import React from 'react';
import { View, FlatList, ViewStyle } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

type ResponsiveGridProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  spacing?: number;
  itemStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
};

export function ResponsiveGrid<T>({
  data,
  renderItem,
  keyExtractor,
  spacing = 12,
  itemStyle,
  contentContainerStyle,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing,
  onRefresh,
  ListHeaderComponent,
}: ResponsiveGridProps<T>) {
  const { width, isMobile, isTablet, isDesktop } = useResponsive();
  const padding = isMobile ? 16 : isTablet ? 24 : 32;

  // Calculate columns based on screen width
  const getColumns = () => {
    if (width >= 1536) return 5; // 2xl
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg
    if (width >= 768) return 2; // md
    return 1; // Mobile: single column on very small screens
  };

  const numColumns = getColumns();
  const itemWidth =
    numColumns > 1
      ? (width - padding * 2 - spacing * (numColumns - 1)) / numColumns
      : width - padding * 2;

  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      keyExtractor={
        keyExtractor ||
        ((item: T, index: number) => {
          if (typeof item === 'object' && item && 'id' in item && typeof (item as { id?: unknown }).id === 'string') {
            return (item as { id: string }).id;
          }
          return `item-${index}`;
        })
      }
      contentContainerStyle={[
        { padding, paddingBottom: 24 },
        contentContainerStyle,
      ]}
      columnWrapperStyle={numColumns > 1 ? { gap: spacing } : undefined}
      renderItem={({ item, index }) => (
        <View style={[{ width: numColumns > 1 ? itemWidth : '100%' }, itemStyle]}>
          {renderItem(item, index)}
        </View>
      )}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}

