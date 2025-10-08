// app/(tabs)/index.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import type { DocumentSnapshot } from "firebase/firestore";
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
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView, // usado só para chips horizontais
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const CATEGORIES = [
  "Ferramentas elétricas","Ferramentas manuais","Construção & Reforma","Marcenaria & Carpintaria","Jardinagem",
  "Camping & Trilha","Esportes & Lazer","Mobilidade (bike/patinete)",
  "Fotografia & Vídeo","Música & Áudio","Informática & Acessórios",
  "Eletroportáteis","Cozinha & Utensílios","Eventos & Festas","Móveis & Decoração",
  "Automotivo & Moto","Bebê & Infantil","Brinquedos & Jogos","Pet","Saúde & Beleza","Outros",
] as const;

type Item = {
  id: string;
  title: string;
  description: string;
  category?: string;
  condition?: string;
  dailyRate?: number;
  minRentalDays?: number;
  photos?: string[];
  createdAt?: any;
  available?: boolean;
  ownerUid?: string;
  published?: boolean;
  city?: string;
  neighborhood?: string;
};

const PAGE_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function formatBRL(n?: number) {
  if (typeof n !== "number" || !isFinite(n)) return "";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  } catch {
    return `R$ ${n.toFixed(2).replace(".", ",")}`;
  }
}

export default function VitrineScreen() {
  const isDark = useColorScheme() === "dark";
  const me = auth.currentUser?.uid || null;

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

  const inputStyle = useMemo(
    () => ({
      borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16,
      color: isDark ? "#fff" : "#111827",
      borderColor: isDark ? "#374151" : "#d1d5db",
      backgroundColor: isDark ? "#111827" : "#fff",
    }),
    [isDark]
  );
  const placeholderColor = isDark ? "#9aa0a6" : "#6b7280";

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
      let page = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Item));
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
      console.warn("[Vitrine] erro ao carregar:", e);
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
    return (
      <TouchableOpacity
        key={value || "_all"}
        onPress={() => setCategory(active ? "" : value)}
        style={{
          paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9999,
          borderWidth: 1, marginRight: 8,
          backgroundColor: active ? (isDark ? "#96ff9a" : "#40EF47") : "transparent",
          borderColor: active ? "transparent" : (isDark ? "#374151" : "#d1d5db"),
        }}
      >
        <ThemedText style={{ color: active ? "#374151" : "#d1d5db" }}>{label}</ThemedText>
      </TouchableOpacity>
    );
  };

  // -------- card de item --------
  const renderItem = ({ item }: { item: Item }) => {
    const isMine = me && item.ownerUid === me;
    return (
      <View
        style={{
          borderWidth: 1, borderRadius: 12, padding: 12,
          borderColor: isDark ? "#374151" : "#e5e7eb",
          backgroundColor: isDark ? "#0b1220" : "#40ef47",
        }}
      >
        {item.photos?.[0] && (
          <Image
            source={{ uri: item.photos[0] }}
            style={{ width: "100%", height: 180, borderRadius: 10, marginBottom: 8 }}
          />
        )}
        <ThemedText type="subtitle" numberOfLines={1}>{item.title}</ThemedText>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          {!!item.category && (
            <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
              <ThemedText>{item.category}</ThemedText>
            </View>
          )}
          {!!item.condition && (
            <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
              <ThemedText>{item.condition}</ThemedText>
            </View>
          )}
          {!!item.minRentalDays && (
            <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
              <ThemedText>{item.minRentalDays} dia(s) mínimo</ThemedText>
            </View>
          )}
          {!!item.city && (
            <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
              <ThemedText>{item.city}</ThemedText>
            </View>
          )}
          {!!item.neighborhood && (
            <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9999, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}>
              <ThemedText>{item.neighborhood}</ThemedText>
            </View>
          )}
        </View>

        <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>
          {formatBRL(item.dailyRate)} / dia
        </ThemedText>

        {!!item.description && (
          <ThemedText style={{ marginTop: 6 }} numberOfLines={2}>
            {item.description}
          </ThemedText>
        )}

        <TouchableOpacity
          onPress={() => router.push(`/item/${item.id}`)}
          disabled={!!isMine}
          style={{
            marginTop: 12,
            opacity: isMine ? 0.5 : 1,
            alignSelf: "flex-start",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#d1d5db",
            backgroundColor: isDark ? "#111827" : "#f9fafb",
          }}
        >
          <ThemedText type="defaultSemiBold">
            {isMine ? "Seu item" : "Reservar"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // -------- header que vai rolar junto --------
  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
      <ThemedText
        type="title"
        style={{ textAlign: "center", fontSize: 24, fontWeight: "800", marginBottom: 8 }}
      >
        Precisou?
      </ThemedText>

      <Image
        source={require("../../assets/images/logo.png")}
        style={{ width: 300, height: 150, borderRadius: 8, marginLeft: 25 }}
        resizeMode="contain"
      />

      <ThemedText style={{ marginBottom: 8, opacity: 0.8 }}>
        O que você quer alugar?
      </ThemedText>

      <TextInput
        placeholder="Buscar por título, descrição…"
        placeholderTextColor={placeholderColor}
        value={search}
        onChangeText={setSearch}
        style={inputStyle}
      />

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Cidade"
            placeholderTextColor={placeholderColor}
            value={city}
            onChangeText={setCity}
            style={inputStyle}
            autoCapitalize="words"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Bairro"
            placeholderTextColor={placeholderColor}
            value={neighborhood}
            onChangeText={setNeighborhood}
            style={inputStyle}
            autoCapitalize="words"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {renderChip("Todas", "")}
        {CATEGORIES.map((c) => renderChip(c, c))}
      </ScrollView>

      {/* Loading no topo enquanto busca a 1ª página */}
      {loading && (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <ActivityIndicator />
          <ThemedText style={{ marginTop: 8 }}>Carregando itens…</ThemedText>
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
      <ThemedView style={{ flex: 1 }}>
        <FlatList
          data={filteredNotMine}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          // 🔑 tudo abaixo faz a página inteira rolar:
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !loading ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                <ThemedText>Nenhum item encontrado.</ThemedText>
              </View>
            ) : null
          }
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.15}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator />
              </View>
            ) : !hasMore && filtered.length > 0 ? (
              <View style={{ padding: 12, alignItems: "center" }}>
                <ThemedText>Fim da lista</ThemedText>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
