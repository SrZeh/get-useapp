// app/reservations/[resId].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function ReservationDetail() {
  const { resId } = useLocalSearchParams<{ resId: string }>();
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid ?? null;
  const isOwner = uid && res?.itemOwnerUid === uid;
  const isRenter = uid && res?.renterUid === uid;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "reservations", String(resId)));
      setRes({ id: resId, ...(snap.data() || {}) });
      setLoading(false);
    })();
  }, [resId]);

  async function liberar() {
    if (!res?.id) return;
    try {
      setBusy(true);
      const fns = getFunctions(undefined, "southamerica-east1");
      const fn = httpsCallable<{ reservationId: string }, any>(fns, "releasePayoutToOwner");
      await fn({ reservationId: String(res.id) });
      Alert.alert("Repasse liberado.");
    } catch (e: any) {
      Alert.alert("Falha ao repassar", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }
  if (!res) {
    return <ThemedView style={{ padding:16 }}><ThemedText>Reserva não encontrada.</ThemedText></ThemedView>;
  }

  return (
    <ThemedView style={{ padding: 16 }}>
      <ThemedText type="title">{res.itemTitle}</ThemedText>
      <ThemedText>{res.startDate} → {res.endDate} ({res.days} dia(s))</ThemedText>
      <ThemedText>Total: R$ {Number(res.total ?? 0)}</ThemedText>
      <ThemedText>Status: {res.status}</ThemedText>

      <View style={{ marginTop: 16, gap: 12 }}>
        {isRenter && res.status === "accepted" && (
          <TouchableOpacity onPress={() => router.push({ pathname: "/transaction/[id]/pay", params: { id: res.id } as any })}>
            <ThemedText type="defaultSemiBold">Pagar agora</ThemedText>
          </TouchableOpacity>
        )}

        {isOwner && res.status === "paid" && (
          <TouchableOpacity onPress={liberar} disabled={busy}>
            <ThemedText type="defaultSemiBold">{busy ? "Liberando…" : "Liberar para o dono (90%)"}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}
