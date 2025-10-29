// app/(tabs)/index.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import type { DocumentSnapshot } from "firebase/firestore";
import { useOnboardingVisibility } from "@/hooks/useOnboarding";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { LiquidGlassView } from "@/components/liquid-glass";
import { CategoryChip } from "@/components/CategoryChip";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { Button } from "@/components/Button";
import { useResponsive } from "@/hooks/useResponsive";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
import { ScrollableCategories } from "@/components/ScrollableCategories";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import type { Item } from "@/types";
import { formatBRL, shuffle } from "@/utils/formatters";
import { logger } from "@/utils/logger";

const CATEGORIES = [
  "Ferramentas elétricas","Ferramentas manuais","Construção & Reforma","Marcenaria & Carpintaria","Jardinagem",
  "Camping & Trilha","Esportes & Lazer","Mobilidade (bike/patinete)",
  "Fotografia & Vídeo","Música & Áudio","Informática & Acessórios",
  "Eletroportáteis","Cozinha & Utensílios","Eventos & Festas","Móveis & Decoração",
  "Automotivo & Moto","Bebê & Infantil","Brinquedos & Jogos","Pet","Saúde & Beleza","Outros",
] as const;

// Mapping of categories to Ionicons
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Ferramentas elétricas": "flash",
  "Ferramentas manuais": "hammer",
  "Construção & Reforma": "construct",
  "Marcenaria & Carpintaria": "cut",
  "Jardinagem": "leaf",
  "Camping & Trilha": "trail-sign",
  "Esportes & Lazer": "football",
  "Mobilidade (bike/patinete)": "bicycle",
  "Fotografia & Vídeo": "camera",
  "Música & Áudio": "musical-notes",
  "Informática & Acessórios": "laptop",
  "Eletroportáteis": "tv",
  "Cozinha & Utensílios": "restaurant",
  "Eventos & Festas": "balloon",
  "Móveis & Decoração": "home",
  "Automotivo & Moto": "car",
  "Bebê & Infantil": "heart",
  "Brinquedos & Jogos": "game-controller",
  "Pet": "paw",
  "Saúde & Beleza": "medical",
  "Outros": "apps",
};

const PAGE_SIZE = 20;

export default function VitrineScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
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

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const isFetchingRef = useRef(false);

  const { visible: showOnboarding, loading: onboardingLoading, markSeen } = useOnboardingVisibility();

  // -------- Query da vitrine (publicados) --------
  const buildQuery = useCallback((firstPage: boolean) => {
    const base = collection(db, "items");
    if (firstPage || !lastDocRef.current) {
      return query(
        base,
        where("published", "==", true),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
    }
    return query(
      base,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(lastDocRef.current as DocumentSnapshot),
      limit(PAGE_SIZE)
    );
  }, []);

  const hasMoreRef = useRef(true);


  const fetchPage = useCallback(
  async (reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (reset) {
      setLoading(true);
      setHasMore(true);
      hasMoreRef.current = true;         // 👈  reseta o ref
      lastDocRef.current = null;
    } else {
      if (!hasMoreRef.current) {         // 👈  usa o ref (não o state)
        isFetchingRef.current = false;
        return;
      }
      setLoadingMore(true);
    }

    try {
      const q = buildQuery(reset);
      const snap = await getDocs(q);
      let page = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as Item));
      page = page.filter((it) => it.published === true && it.available !== false);

      if (snap.docs.length) {
        lastDocRef.current = snap.docs[snap.docs.length - 1];
      }
      if (snap.docs.length < PAGE_SIZE) {
        setHasMore(false);
        hasMoreRef.current = false;      // 👈  sincroniza o ref
      }

      setItems((prev) => (reset ? shuffle(page) : [...prev, ...shuffle(page)]));
    } catch (e) {
      logger.warn("Error loading items", { error: e });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  },
  [buildQuery] // 👈  remove hasMore daqui
);


 useEffect(() => {
  // primeira carga
  fetchPage(true); // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPage(true);
  };
  const loadMore = async () => {
  if (loading || loadingMore || !hasMoreRef.current) return;
  await fetchPage(false);
};


  // -------- filtros locais (texto/cidade/bairro/categoria) --------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cityQ = city.trim().toLowerCase();
    const neighQ = neighborhood.trim().toLowerCase();

    return items.filter((it) => {
      if (category && (it.category ?? "") !== category) return false;
      if (cityQ && (it.city ?? "").toLowerCase() !== cityQ) return false;
      if (neighQ && (it.neighborhood ?? "").toLowerCase() !== neighQ) return false;

      if (!q) return true;
      const hay = `${it.title ?? ""} ${it.description ?? ""} ${it.category ?? ""} ${it.condition ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, category, city, neighborhood]);

  const filteredNotMine = useMemo(() => {
  if (!me) return filtered;            // visitante vê tudo
  return filtered.filter((it) => it.ownerUid !== me);
}, [filtered, me]);


  


  // -------- chips de categoria --------
  const renderChip = (label: string, value: string) => {
    const active = category === value;
    const icon = value ? CATEGORY_ICONS[value] : undefined;
    return (
      <CategoryChip
        key={value || "_all"}
        label={label}
        selected={active}
        onPress={() => setCategory(active ? "" : value)}
        icon={icon}
      />
    );
  };

  // -------- card de item --------
  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const isMine = me && item.ownerUid === me;
    // Don't use isLastInRow with responsive grid - spacing is handled by columnWrapperStyle
    const cardStyle: ViewStyle = {
      width: numColumns > 1 ? cardWidth : (screenWidth - (screenPadding * 2)),
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden" as const,
      marginBottom: cardSpacing,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderColor: isDark ? "#374151" : "#e5e7eb",
      opacity: isMine ? 0.6 : 1,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    };
    return (
      <TouchableOpacity
        onPress={() => !isMine && router.push(`/item/${item.id}`)}
        disabled={!!isMine}
        activeOpacity={0.7}
        style={cardStyle}
      >
        {item.photos?.[0] ? (
          <Image
            source={{ uri: item.photos[0] }}
            style={{ 
              width: "100%",
              height: cardWidth * 0.75, // Maintain aspect ratio
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6"
            }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View 
            style={{ 
              width: "100%",
              height: cardWidth * 0.75,
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6" 
            }} 
          />
        )}
        <View style={{ width: "100%", padding: 16 }}>
          <ThemedText 
            type="title-3" 
            numberOfLines={1}
            style={{ marginBottom: 12, fontWeight: '600' }}
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            {item.title}
          </ThemedText>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {!!item.category && (
              <View style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6"
              }}>
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {item.category}
                </ThemedText>
              </View>
            )}
            {!!item.condition && (
              <View style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6"
              }}>
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {item.condition}
                </ThemedText>
              </View>
            )}
            {!!item.minRentalDays && (
              <View style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6"
              }}>
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {item.minRentalDays} dia(s) mínimo
                </ThemedText>
              </View>
            )}
            {!!item.city && (
              <View style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6"
              }}>
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {item.city}
                </ThemedText>
              </View>
            )}
            {!!item.neighborhood && (
              <View style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6"
              }}>
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {item.neighborhood}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <ThemedText 
            type="title-2" 
            style={{ fontWeight: "700" }}
            lightColor="#08af0e"
            darkColor="#96ff9a"
          >
            {formatBRL(item.dailyRate)}
          </ThemedText>
            <ThemedText 
              type="footnote" 
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              / dia
            </ThemedText>
          </View>

          {!!item.description && (
            <ThemedText 
              type="footnote" 
              numberOfLines={2}
              style={{ marginBottom: 12 }}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              {item.description}
            </ThemedText>
          )}

          <Button
            variant="primary"
            onPress={() => !isMine && router.push(`/item/${item.id}`)}
            disabled={!!isMine}
            style={{
              alignSelf: "flex-start",
              opacity: isMine ? 0.5 : 1,
            }}
          >
            {isMine ? "Seu item" : "Ver detalhes"}
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

  // -------- header que vai rolar junto --------
  const renderHeader = () => (
    <View style={{ 
      paddingHorizontal: screenPadding, 
      paddingTop: 16, 
      paddingBottom: 8,
      width: "100%",
      backgroundColor: palette.background,
    }}>
      <ThemedText
        type="large-title"
        style={{ textAlign: "center", marginBottom: 8 }}
        className="text-light-text-primary dark:text-dark-text-primary"
      >
        Precisou?
      </ThemedText>

      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 300, height: 150 }}
          contentFit="contain"
          transition={200}
        />
      </View>

      <ThemedText 
        type="callout" 
        style={{ marginBottom: 12 }}
        className="text-light-text-primary dark:text-dark-text-secondary"
      >
        O que você quer alugar?
      </ThemedText>

      <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="Buscar por título, descrição…"
          placeholderTextColor={palette.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "transparent",
            color: palette.text,
            fontSize: 17,
          }}
        />
      </LiquidGlassView>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <LiquidGlassView intensity="subtle" cornerRadius={16}>
            <TextInput
              placeholder="Cidade"
              placeholderTextColor={palette.textTertiary}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              style={{
                width: "100%",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "transparent",
                color: palette.text,
                fontSize: 17,
              }}
            />
          </LiquidGlassView>
        </View>
        <View style={{ flex: 1 }}>
          <LiquidGlassView intensity="subtle" cornerRadius={16}>
            <TextInput
              placeholder="Bairro"
              placeholderTextColor={palette.textTertiary}
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              style={{
                width: "100%",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "transparent",
                color: palette.text,
                fontSize: 17,
              }}
            />
          </LiquidGlassView>
        </View>
      </View>

      {/* Responsive Categories with Navigation Arrows */}
      <ScrollableCategories>
        {renderChip("Todas", "")}
        {CATEGORIES.map((c) => renderChip(c, c))}
      </ScrollableCategories>

      {/* Loading no topo enquanto busca a 1ª página */}
      {loading && (
        <View style={{ paddingVertical: 16, paddingHorizontal: screenPadding }}>
          <ShimmerLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <ShimmerLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <ShimmerLoader height={120} borderRadius={12} />
        </View>
      )}
    </View>
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
          backgroundColor: palette.background,
          width: "100%",
        }}
      >
        <FlatList
          data={filteredNotMine}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !loading ? (
              <View style={{ 
                paddingHorizontal: screenPadding, 
                paddingBottom: 48,
                width: "100%",
              }}>
                <ThemedText 
                  type="body"
                  style={{ textAlign: "center" }}
                  className="text-light-text-secondary dark:text-dark-text-secondary"
                >
                  Nenhum item encontrado.
                </ThemedText>
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
            paddingBottom: 24,
            paddingHorizontal: numColumns > 1 ? 0 : screenPadding,
            flexGrow: 1,
          }}
          key={`grid-${numColumns}`} // Force re-render when columns change
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={palette.tint}
            />
          }
          onEndReachedThreshold={0.15}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 16, paddingHorizontal: screenPadding }}>
                <ShimmerLoader height={120} borderRadius={12} />
              </View>
            ) : !hasMore && filtered.length > 0 ? (
              <View style={{ padding: 12, alignItems: "center" }}>
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
