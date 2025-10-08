// app/(tabs)/items.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

type Item = {
  id: string;
  title: string;
  description: string;
  photos?: string[];
  available?: boolean;
  createdAt?: any;
};

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const cardStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      borderColor: isDark ? "#374151" : "#e5e7eb",
      backgroundColor: isDark ? "#0b1220" : "#40ef47",
    }),
    [isDark]
  );

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
      console.log("[Items] uid:", user.uid);

      // 🔹 Assina meus itens (ownerUid == uid)
      const q = query(
        collection(db, "items"),
        where("ownerUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(
        q,
        async (snap) => {
          let data: Item[] = snap.docs.map((d) => {
            const x = d.data() as any;
            return {
              id: d.id,
              title: x.title ?? "(sem título)",
              description: x.description ?? "",
              photos: x.photos ?? [],
              available: x.available ?? true,
              createdAt: x.createdAt ?? serverTimestamp(),
            };
          });

          // 🔸 Fallback para itens “legados” que guardaram `owner` (não `ownerUid`)
          // Busca 1x e mescla (sem stream) — remove depois que migrar seus docs.
          if (data.length === 0) {
            try {
              const qLegacy = query(
                collection(db, "items"),
                where("owner", "==", user.uid),
                orderBy("createdAt", "desc")
              );
              const sLegacy = await getDocs(qLegacy);
              const legacy = sLegacy.docs.map((d) => {
                const x = d.data() as any;
                return {
                  id: d.id,
                  title: x.title ?? "(sem título)",
                  description: x.description ?? "",
                  photos: x.photos ?? [],
                  available: x.available ?? true,
                  createdAt: x.createdAt ?? serverTimestamp(),
                } as Item;
              });
              if (legacy.length) data = legacy;
            } catch (e: any) {
              // se precisar de índice, o console vai apontar o link
              if (String(e?.message).includes("requires an index")) {
                console.warn("[Items] Crie o índice sugerido pelo Firestore para owner/createdAt.");
              } else {
                console.warn("[Items] Fallback legacy erro:", e?.message ?? e);
              }
            }
          }

          setItems(data);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
          console.log("LISTEN ERROR", err?.code, err?.message);
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
        const x = d.data() as any;
        return {
          id: d.id,
          title: x.title ?? "(sem título)",
          description: x.description ?? "",
          photos: x.photos ?? [],
          available: x.available ?? true,
          createdAt: x.createdAt ?? serverTimestamp(),
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
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? String(e));
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
            } catch (e: any) {
              Alert.alert("Erro ao excluir", e?.message ?? String(e));
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const goNew = () => router.push("/item/new");
  const goEdit = (id: string) => router.push(`/item/edit/${id}`);

  return (
    <ThemedView style={{ flex: 1, padding: 56 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <ThemedText type="title">Meus Itens</ThemedText>
        <TouchableOpacity
          onPress={goNew}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: isDark ? "#00ce08" : "#00ce08",
            borderRadius: 10,
          }}
        >
          <ThemedText style={{ color: "#fff" }} type="defaultSemiBold">
            + Novo
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
          <ThemedText style={{ marginTop: 8 }}>Carregando...</ThemedText>
        </View>
      ) : items.length === 0 ? (
        <ThemedText style={{ marginTop: 16 }}>
          Você ainda não cadastrou itens.
        </ThemedText>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(it) => it.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View style={cardStyle}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <ThemedText type="subtitle" style={{ flexShrink: 1 }}>
                  {item.title}
                </ThemedText>
                <View
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 9999,
                    backgroundColor: item.available ? "#16a34a33" : "#6b728033",
                  }}
                >
                  <ThemedText style={{ color: item.available ? "#00ff80" : "#6b7280" }}>
                    {item.available ? "Disponível" : "Alugado"}
                  </ThemedText>
                </View>
              </View>

              {item.photos?.[0] && (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={{ width: "100%", height: 160, marginTop: 8, borderRadius: 10 }}
                />
              )}

              {!!item.description && (
                <ThemedText style={{ marginTop: 8 }} numberOfLines={3}>
                  {item.description}
                </ThemedText>
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => goEdit(item.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#374151" : "#b1f8b4",
                    alignItems: "center",
                  }}
                >
                  <ThemedText>Editar</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleAvailability(item)}
                  disabled={updatingId === item.id}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: item.available ? "#f59e0b" : "#16a34a",
                    alignItems: "center",
                    opacity: updatingId === item.id ? 0.6 : 1,
                  }}
                >
                  <ThemedText style={{ color: "#fff" }}>
                    {item.available ? "Marcar Alugado" : "Marcar Disponível"}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmDelete(item)}
                  disabled={updatingId === item.id}
                  style={{
                    width: 48,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "#dc2626",
                    alignItems: "center",
                    opacity: updatingId === item.id ? 0.6 : 1,
                  }}
                >
                  <ThemedText style={{ color: "#fff" }}>X</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}
