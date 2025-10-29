// app/(tabs)/index.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import type { DocumentSnapshot } from "firebase/firestore";
import { useOnboardingVisibility } from "@/hooks/useOnboarding";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { useResponsive } from "@/hooks/useResponsive";
import { ItemCard } from "@/components/items";
import { SearchHeader } from "@/components/search";
import { EmptyState } from "@/components/states";
import { useLocations } from "@/hooks/useLocations";
import {
  collection,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  View,
} from "react-native";
import { Spacing, BorderRadius } from "@/constants/spacing";
import type { Item } from "@/types";
import { filterItems, type ItemFilters } from "@/utils";
import { useThemeColors } from "@/utils/theme";

const CATEGORIES = [
  "Ferramentas elétricas","Ferramentas manuais","Construção & Reforma","Marcenaria & Carpintaria","Jardinagem",
  "Camping & Trilha","Esportes & Lazer","Mobilidade (bike/patinete)",
  "Fotografia & Vídeo","Música & Áudio","Informática & Acessórios",
  "Eletroportáteis","Cozinha & Utensílios","Eventos & Festas","Móveis & Decoração",
  "Automotivo & Moto","Bebê & Infantil","Brinquedos & Jogos","Pet","Saúde & Beleza","Outros",
] as const;

const PAGE_SIZE = 20;

export default function VitrineScreen() {
  const colors = useThemeColors();
  const { width: screenWidth, isMobile, isTablet, isDesktop } = useResponsive();
  const me = auth.currentUser?.uid || null;

  // Responsive grid columns
  const getNumColumns = () => {
    if (screenWidth >= 1536) return 5; // 2xl
    if (screenWidth >= 1280) return 4; // xl
    if (screenWidth >= 1024) return 3; // lg
    if (screenWidth >= 768) return 2;  // md/tablet
    return 1; // Mobile: single column on very small screens
  };

  const numColumns = getNumColumns();
  const cardSpacing = 12;
  const screenPadding = isMobile ? 16 : isTablet ? 24 : 32;
  
  // Calculate card width dynamically based on current screen width
  const cardWidth = numColumns > 1
    ? (screenWidth - (screenPadding * 2) - (cardSpacing * (numColumns - 1))) / numColumns
    : screenWidth - (screenPadding * 2);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  
  // Dropdown filter states for single selections
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Fetch cities and neighborhoods from Firebase
  const { cities, neighborhoods, loading: locationsLoading } = useLocations();

  const { visible: showOnboarding, loading: onboardingLoading, markSeen } = useOnboardingVisibility();

  // -------- Query da vitrine (publicados) --------
  const buildQuery = useCallback(
    (firstPage: boolean, lastDoc: DocumentSnapshot | null) => {
      const base = collection(db, 'items');
      if (firstPage || !lastDoc) {
        return query(base, where('published', '==', true), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      }
      return query(
        base,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    },
    []
  );

  // Use pagination hook
  const { items, loading, loadingMore, hasMore, refreshing, refresh, loadMore } = usePagination<Item>({
    queryBuilder: buildQuery,
    pageSize: PAGE_SIZE,
    defaultTransform: (docs) =>
      docs
        .map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as Item))
        .filter((it) => it.published === true && it.available !== false),
  });

  const onRefresh = refresh;


  // -------- filtros locais (texto/cidade/bairro/categoria/preço) --------
  // Combine text input filters with dropdown selections
  // If dropdowns are selected, use them; otherwise fall back to text inputs
  const filters: ItemFilters = useMemo(
    () => ({
      search,
      category,
      city: selectedCity || city || undefined,
      neighborhood: selectedNeighborhood || neighborhood || undefined,
      minPrice: minPrice !== null ? minPrice : undefined,
      maxPrice: maxPrice !== null ? maxPrice : undefined,
      excludeOwnerUid: me || undefined,
    }),
    [search, category, city, neighborhood, selectedCity, selectedNeighborhood, minPrice, maxPrice, me]
  );

  const filteredItems = useMemo(() => filterItems(items, filters), [items, filters]);


  


  // -------- card de item --------
  const renderItem = useCallback(
    ({ item }: { item: Item; index: number }) => {
      const isMine = Boolean(me && item.ownerUid === me);
      const itemWidth = numColumns > 1 ? cardWidth : screenWidth - screenPadding * 2;

      return (
        <ItemCard
          item={item}
          width={itemWidth}
          isMine={isMine}
          cardSpacing={cardSpacing}
        />
      );
    },
    [me, numColumns, cardWidth, screenWidth, screenPadding, cardSpacing]
  );

  // -------- header que vai rolar junto --------
  const renderHeader = () => (
    <SearchHeader
      search={search}
      onSearchChange={setSearch}
      city={city}
      onCityChange={setCity}
      neighborhood={neighborhood}
      onNeighborhoodChange={setNeighborhood}
      category={category}
      onCategoryChange={(cat) => setCategory(cat)}
      categories={CATEGORIES}
      loading={loading}
      screenPadding={screenPadding}
      cities={cities}
      neighborhoods={neighborhoods}
      selectedCity={selectedCity}
      selectedNeighborhood={selectedNeighborhood}
      onCitySelect={setSelectedCity}
      onNeighborhoodSelect={setSelectedNeighborhood}
      locationsLoading={locationsLoading}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
    />
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
          data={filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          ListEmptyComponent={
            !loading ? (
              <View style={{ paddingHorizontal: screenPadding, paddingBottom: Spacing.xl }}>
                <EmptyState message="Nenhum item encontrado." />
              </View>
            ) : null
          }
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? {
            paddingHorizontal: screenPadding,
            justifyContent: "flex-start",
            gap: cardSpacing,
          } : undefined}
          contentContainerStyle={{ 
            paddingBottom: Spacing.md,
            paddingHorizontal: numColumns > 1 ? 0 : screenPadding,
            flexGrow: 1,
          }}
          key={`grid-${numColumns}`} // Force re-render when columns change
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.icon.selected}
            />
          }
          onEndReachedThreshold={0.15}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: Spacing.sm, paddingHorizontal: screenPadding }}>
                <ShimmerLoader height={120} borderRadius={BorderRadius.sm} />
              </View>
            ) : !hasMore && filteredItems.length > 0 ? (
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
