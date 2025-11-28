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
import { ItemCard } from "@/components/features/items";
import { SearchHeader } from "@/components/search";
import { EmptyState } from "@/components/states";
import { Footer } from "@/components/Footer";
import { useItemList, useResponsiveGrid } from "@/hooks/features/items";
import { useHelpRequests } from "@/hooks/features/help";
import { Spacing, BorderRadius } from "@/constants/spacing";
import type { Item } from "@/types";
import { useThemeColors } from "@/utils/theme";
import { SeoHead } from "@/utils/seo";
import { itemsListingPtBR } from "@/constants/seo/examples/items.pt-BR";
import { HelpRequestCard } from "@/components/features/help";

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
  const { requests: helpRequests } = useHelpRequests();

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

  // Header como elemento memoizado para evitar remontagem a cada render
  const headerElement = React.useMemo(
    () => (
      <>
        {/* Help Requests (Socorro!) */}
        {helpRequests.length > 0 && (
          <View style={{ paddingHorizontal: grid.screenPadding, paddingTop: Spacing.sm, paddingBottom: Spacing.xs }}>
            {helpRequests.map((request) => (
              <HelpRequestCard key={request.id} request={request} />
            ))}
          </View>
        )}
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
      </>
    ),
    [
      itemList.filters.search,
      itemList.filters.city,
      itemList.filters.neighborhood,
      itemList.filters.category,
      itemList.filters.selectedCity,
      itemList.filters.selectedNeighborhood,
      itemList.filters.minPrice,
      itemList.filters.maxPrice,
      itemList.cities,
      itemList.neighborhoods,
      itemList.loading,
      itemList.locationsLoading,
      grid.screenPadding,
      helpRequests,
    ]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <SeoHead meta={itemsListingPtBR} />
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
          ListHeaderComponent={headerElement}
          ListFooterComponent={<Footer />}
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
            paddingBottom: 0,
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

