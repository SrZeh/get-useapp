// app/(tabs)/items.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LinearGradient } from "expo-linear-gradient";
import { GradientTypes, HapticFeedback, useThemeColors, calcAvg, renderStars, logger } from "@/utils";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image as ExpoImage } from "expo-image";
import type { Item } from "@/types";
import { useNavigationService } from "@/providers/ServicesProvider";

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const isDark = scheme === "dark";
  const navigation = useNavigationService();


  // guardo unsub para limpar quando trocar de usuário
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, (user) => {
      // limpa listener anterior, se houver
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      logger.debug("Loading items for user", { uid: user.uid });

      // 🔹 Assina meus itens (ownerUid == uid)
      const q = query(
        collection(db, "items"),
        where("ownerUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(
        q,
        async         (snap) => {
          let data: Item[] = snap.docs.map((d) => {
            const x = d.data() as Partial<Item>;
            return {
              id: d.id,
              title: x.title ?? "(sem título)",
              description: x.description ?? "",
              photos: x.photos ?? [],
              available: x.available ?? true,
              createdAt: x.createdAt ?? serverTimestamp(),
              ratingCount: x.ratingCount ?? 0,
              ratingSum: x.ratingSum ?? 0,
              ownerRatingCount: x.ownerRatingCount ?? 0,
              ownerRatingSum: x.ownerRatingSum ?? 0,
            } as Item;
          });

          // 🔸 Fallback para itens “legados” com `owner` (não `ownerUid`)
          if (data.length === 0) {
            try {
              const qLegacy = query(
                collection(db, "items"),
                where("owner", "==", user.uid),
                orderBy("createdAt", "desc")
              );
              const sLegacy = await getDocs(qLegacy);
              const legacy = sLegacy.docs.map((d) => {
                const x = d.data() as Partial<Item>;
                return {
                  id: d.id,
                  title: x.title ?? "(sem título)",
                  description: x.description ?? "",
                  photos: x.photos ?? [],
                  available: x.available ?? true,
                  createdAt: x.createdAt ?? serverTimestamp(),
                  ratingCount: x.ratingCount ?? 0,
                  ratingSum: x.ratingSum ?? 0,
                  ownerRatingCount: x.ownerRatingCount ?? 0,
                  ownerRatingSum: x.ownerRatingSum ?? 0,
                } as Item;
              });
              if (legacy.length) data = legacy;
            } catch (e: unknown) {
              const error = e as { message?: string };
              if (String(error?.message).includes("requires an index")) {
                logger.warn("Firestore index required", { message: "Crie o índice sugerido pelo Firestore para owner/createdAt." });
              } else {
                logger.warn("Legacy fallback error", { error: error?.message ?? e });
              }
            }
          }

          setItems(data);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
          logger.error("Items snapshot listener error", err, { code: err?.code, message: err?.message });
          if (String(err?.message).includes("requires an index")) {
            Alert.alert(
              "Índice necessário",
              "O Firestore pediu um índice para esta consulta. Abra o console e clique no link sugerido."
            );
          }
        }
      );

      unsubRef.current = unsub;
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
      stopAuth();
    };
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "items"),
        where("ownerUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data: Item[] = snap.docs.map((d) => {
        const x = d.data() as Partial<Item>;
        return {
          id: d.id,
          title: x.title ?? "(sem título)",
          description: x.description ?? "",
          photos: x.photos ?? [],
          available: x.available ?? true,
          createdAt: x.createdAt ?? serverTimestamp(),
          ratingCount: x.ratingCount ?? 0,
          ratingSum: x.ratingSum ?? 0,
          ownerRatingCount: x.ownerRatingCount ?? 0,
          ownerRatingSum: x.ownerRatingSum ?? 0,
        };
      });
      setItems(data);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAvailability = async (item: Item) => {
    try {
      setUpdatingId(item.id);
      await updateDoc(doc(db, "items", item.id), {
        available: !item.available,
        updatedAt: serverTimestamp(),
      });
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro", error?.message ?? String(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = (item: Item) => {
    Alert.alert(
      "Excluir item",
      `Tem certeza que deseja excluir "${item.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingId(item.id);
              await deleteDoc(doc(db, "items", item.id));
            } catch (e: unknown) {
              const error = e as { message?: string };
              Alert.alert("Erro ao excluir", error?.message ?? String(e));
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const goNew = () => navigation.navigateToNewItem();
  const goEdit = (id: string) => navigation.navigateToEditItem(id);

  const renderItem = useCallback(({ item }: { item: Item }) => (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden' }}>
        {item.photos?.[0] && (
          <ExpoImage
            source={{ uri: item.photos[0] }}
            style={{ width: "100%", height: 200 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={item.photos[0]}
          />
        )}
        
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <ThemedText type="title-small" style={{ flexShrink: 1, fontWeight: '600' }} numberOfLines={2}>
              {item.title}
            </ThemedText>

            <LinearGradient
              colors={item.available ? GradientTypes.success.colors : [colors.text.quaternary, colors.text.tertiary]}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
              }}
            >
              <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff', fontSize: 12, fontWeight: '600' }}>
                {item.available ? "Disponível" : "Alugado"}
              </ThemedText>
            </LinearGradient>
          </View>

          {/* Ratings */}
          <View style={{ marginTop: 8, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ThemedText type="caption" style={{ fontWeight: '600' }}>Produto:</ThemedText>
              {(() => {
                const avg = calcAvg(item.ratingSum, item.ratingCount);
                if (!avg) return <ThemedText type="caption">—</ThemedText>;
                return (
                  <ThemedText type="caption">
                    {renderStars(avg)} {avg.toFixed(1)} ({item.ratingCount})
                  </ThemedText>
                );
              })()}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ThemedText type="caption" style={{ fontWeight: '600' }}>Dono:</ThemedText>
              {(() => {
                const avg = calcAvg(item.ownerRatingSum, item.ownerRatingCount);
                if (!avg) return <ThemedText type="caption">—</ThemedText>;
                return (
                  <ThemedText type="caption">
                    {renderStars(avg)} {avg.toFixed(1)} ({item.ownerRatingCount})
                  </ThemedText>
                );
              })()}
            </View>
          </View>

          {!!item.description && (
            <ThemedText style={{ marginTop: 12 }} numberOfLines={2} className="text-light-text-secondary dark:text-dark-text-secondary">
              {item.description}
            </ThemedText>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Button
              variant="secondary"
              onPress={() => {
                HapticFeedback.light();
                goEdit(item.id);
              }}
              style={{ flex: 1 }}
              textStyle={{ fontSize: 14 }}
            >
              Editar
            </Button>

            <Button
              variant={item.available ? "primary" : "premium"}
              onPress={() => {
                HapticFeedback.medium();
                toggleAvailability(item);
              }}
              disabled={updatingId === item.id}
              loading={updatingId === item.id}
              style={{ flex: 1 }}
              textStyle={{ fontSize: 14 }}
            >
              {item.available ? "Marcar Alugado" : "Marcar Disponível"}
            </Button>

            <TouchableOpacity
              onPress={() => {
                HapticFeedback.medium();
                confirmDelete(item);
              }}
              disabled={updatingId === item.id}
              style={{
                width: 48,
                minHeight: 48, // Ensure minimum touch target size
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: colors.semantic.error,
                opacity: updatingId === item.id ? 0.6 : 1,
              }}
              accessibilityLabel="Excluir item"
              accessibilityHint="Exclui permanentemente este item"
              accessibilityRole="button"
              accessibilityState={{ disabled: updatingId === item.id }}
            >
              <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff', fontSize: 18, fontWeight: '700' }}>×</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  ), [updatingId, goEdit, toggleAvailability, confirmDelete]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
        <ThemedText type="large-title">Meus Itens</ThemedText>
        <Button variant="primary" onPress={goNew}>
          + Novo
        </Button>
      </View>

      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <ShimmerLoader height={200} borderRadius={20} />
          <ShimmerLoader height={200} borderRadius={20} />
          <ShimmerLoader height={200} borderRadius={20} />
        </View>
      ) : items.length === 0 ? (
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ margin: 16, padding: 32, alignItems: 'center' }}>
          <ThemedText type="title" style={{ marginBottom: 8, textAlign: 'center' }}>
            Você ainda não cadastrou itens.
          </ThemedText>
          <Button variant="primary" onPress={goNew} style={{ marginTop: 16 }}>
            Criar primeiro item
          </Button>
        </LiquidGlassView>
      ) : (
        <FlatList
          data={items}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.brand.primary}
            />
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
