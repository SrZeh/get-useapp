/**
 * Home Screen - Item Showcase (Vitrine)
 * 
 * Refactored to use custom hooks for business logic:
 * - useItemList: Handles filtering, pagination, and data fetching
 * - useResponsiveGrid: Handles responsive layout calculations
 * 
 * Screen is now a presentational component focused on UI composition.
 */

import React, { useCallback } from "react";
import { FlatList, KeyboardAvoidingView, Platform, RefreshControl, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { useOnboardingVisibility } from "@/hooks/useOnboarding";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { ItemCard } from "@/components/items";
import { SearchHeader } from "@/components/search";
import { EmptyState } from "@/components/states";
import { useItemList } from "@/hooks/features/useItemList";
import { useResponsiveGrid } from "@/hooks/features/useResponsiveGrid";
import { Spacing, BorderRadius } from "@/constants/spacing";
import type { Item } from "@/types";
import { useThemeColors } from "@/utils/theme";

const CATEGORIES = [
  "Ferramentas elétricas","Ferramentas manuais","Construção & Reforma","Marcenaria & Carpintaria","Jardinagem",
  "Camping & Trilha","Esportes & Lazer","Mobilidade (bike/patinete)",
  "Fotografia & Vídeo","Música & Áudio","Informática & Acessórios",
  "Eletroportáteis","Cozinha & Utensílios","Eventos & Festas","Móveis & Decoração",
  "Automotivo & Moto","Bebê & Infantil","Brinquedos & Jogos","Pet","Saúde & Beleza","Outros",
] as const;

export default function VitrineScreen() {
  const colors = useThemeColors();
  const me = auth.currentUser?.uid || null;

  // Business logic - extracted to hooks
  const itemList = useItemList();
  const grid = useResponsiveGrid(12);

  const { visible: showOnboarding, markSeen } = useOnboardingVisibility();


  


  // Render item card
  const renderItem = useCallback(
    ({ item }: { item: Item; index: number }) => {
      const isMine = Boolean(me && item.ownerUid === me);

      return (
        <ItemCard
          item={item}
          width={grid.cardWidth}
          isMine={isMine}
          cardSpacing={grid.cardSpacing}
        />
      );
    },
    [me, grid]
  );

  // Render search header
  const renderHeader = useCallback(
    () => (
      <SearchHeader
        search={itemList.filters.search}
        onSearchChange={itemList.actions.setSearch}
        city={itemList.filters.city}
        onCityChange={itemList.actions.setCity}
        neighborhood={itemList.filters.neighborhood}
        onNeighborhoodChange={itemList.actions.setNeighborhood}
        category={itemList.filters.category}
        onCategoryChange={itemList.actions.setCategory}
        categories={CATEGORIES}
        loading={itemList.loading}
        screenPadding={grid.screenPadding}
        cities={itemList.cities}
        neighborhoods={itemList.neighborhoods}
        selectedCity={itemList.filters.selectedCity}
        selectedNeighborhood={itemList.filters.selectedNeighborhood}
        onCitySelect={itemList.actions.setSelectedCity}
        onNeighborhoodSelect={itemList.actions.setSelectedNeighborhood}
        locationsLoading={itemList.locationsLoading}
        minPrice={itemList.filters.minPrice}
        maxPrice={itemList.filters.maxPrice}
        onMinPriceChange={itemList.actions.setMinPrice}
        onMaxPriceChange={itemList.actions.setMaxPrice}
      />
    ),
    [itemList, grid]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView 
        style={{ 
          flex: 1, 
          backgroundColor: colors.bg.secondary,
          width: "100%",
        }}
      >
        <FlatList
          data={itemList.filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          ListEmptyComponent={
            !itemList.loading ? (
              <View style={{ paddingHorizontal: grid.screenPadding, paddingBottom: Spacing.xl }}>
                <EmptyState message="Nenhum item encontrado." />
              </View>
            ) : null
          }
          numColumns={grid.numColumns}
          columnWrapperStyle={grid.numColumns > 1 ? {
            paddingHorizontal: grid.screenPadding,
            justifyContent: "flex-start",
            gap: grid.cardSpacing,
          } : undefined}
          contentContainerStyle={{ 
            paddingBottom: Spacing.md,
            paddingHorizontal: grid.numColumns > 1 ? 0 : grid.screenPadding,
            flexGrow: 1,
          }}
          key={`grid-${grid.numColumns}`}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl 
              refreshing={itemList.refreshing} 
              onRefresh={itemList.refresh}
              tintColor={colors.icon.selected}
            />
          }
          onEndReachedThreshold={0.15}
          onEndReached={itemList.loadMore}
          ListFooterComponent={
            itemList.loadingMore ? (
              <View style={{ padding: Spacing.sm, paddingHorizontal: grid.screenPadding }}>
                <ShimmerLoader height={120} borderRadius={BorderRadius.sm} />
              </View>
            ) : !itemList.hasMore && itemList.filteredItems.length > 0 ? (
              <View style={{ padding: Spacing.xs, alignItems: "center" }}>
                <ThemedText 
                  type="footnote"
                  className="text-light-text-tertiary dark:text-dark-text-tertiary"
                >
                  {/* Fim da lista */}
                </ThemedText>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        />
        {showOnboarding && (
          <OnboardingModal visible={true} onClose={(opts) => markSeen(opts)} />
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
