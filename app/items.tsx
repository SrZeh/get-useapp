// app/items.tsx
import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { ShimmerLoader } from '@/components/ShimmerLoader';
import { ItemManagementCard } from '@/components/features/items';
import { Footer } from '@/components/Footer';
import { useThemeColors } from '@/utils';
import { useNavigationService } from '@/providers/ServicesProvider';
import { useUserItems, useItemOperations } from '@/hooks/features/items';
import type { Item } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

/**
 * ItemsScreen - displays and manages user's items
 * 
 * Refactored to follow SOLID principles:
 * - Single Responsibility: Focuses on composition and layout only
 * - Open/Closed: Extensible through hooks and components
 * - Dependency Inversion: Depends on abstractions (hooks) not concrete implementations
 */
export default function ItemsScreen() {
  const colors = useThemeColors();
  const navigation = useNavigationService();
  const { items, loading, refreshing, refresh } = useUserItems();
  const { updatingId, toggleAvailability, confirmDelete } = useItemOperations();

  const goNew = () => navigation.navigateToNewItem();
  const goEdit = (id: string) => navigation.navigateToEditItem(id);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <ItemManagementCard
        item={item}
        isUpdating={updatingId === item.id}
        onEdit={goEdit}
        onToggleAvailability={toggleAvailability}
        onDelete={confirmDelete}
      />
    ),
    [updatingId, toggleAvailability, confirmDelete]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.sm,
          marginTop: Spacing['2xl'],
        }}
      >
        <ThemedText type="large-title">Meus Itens</ThemedText>
        <Button variant="primary" onPress={goNew}>
          + Novo
        </Button>
      </View>

      {loading ? (
        <View style={{ padding: Spacing.sm, gap: Spacing.xs }}>
          <ShimmerLoader height={200} borderRadius={BorderRadius.lg} />
          <ShimmerLoader height={200} borderRadius={BorderRadius.lg} />
          <ShimmerLoader height={200} borderRadius={BorderRadius.lg} />
        </View>
      ) : items.length === 0 ? (
        <LiquidGlassView
          intensity="standard"
          cornerRadius={BorderRadius.xl}
          style={{ margin: Spacing.sm, padding: Spacing.lg, alignItems: 'center' }}
        >
          <ThemedText type="title" style={{ marginBottom: Spacing['2xs'], textAlign: 'center' }}>
            Você ainda não cadastrou itens.
          </ThemedText>
          <Button variant="primary" onPress={goNew} style={{ marginTop: Spacing.sm }}>
            Criar primeiro item
          </Button>
        </LiquidGlassView>
      ) : (
        <FlatList
          data={items}
          refreshing={refreshing}
          onRefresh={refresh}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: Spacing.sm, paddingBottom: 0 }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListFooterComponent={<Footer />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand.primary} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          renderItem={renderItem}
        />
      )}
    </ThemedView>
  );
}

