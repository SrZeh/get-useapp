// app/reservations/[resId].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { markPickup, releasePayoutToOwner } from "@/services/cloudFunctions";
import { formatBRL } from "@/utils/formatters";
import type { Reservation } from "@/types";

export default function ReservationDetail() {
  const { resId } = useLocalSearchParams<{ resId: string }>();
  const [res, setRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const uid = auth.currentUser?.uid ?? null;
  const isOwner = !!uid && res?.itemOwnerUid === uid;
  const isRenter = !!uid && res?.renterUid === uid;

  // helper para recarregar o doc (evita conflito de nome "refresh")
  async function reload() {
    const snap = await getDoc(doc(db, "reservations", String(resId)));
    if (snap.exists()) {
      setRes({ id: resId, ...(snap.data() as Partial<Reservation>) } as Reservation);
    } else {
      setRes(null);
    }
  }

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
  }, [resId]);

  async function liberar() {
    if (!res?.id) return;
    try {
      setBusy(true);
      await releasePayoutToOwner(String(res.id));
      Alert.alert("Repasse liberado.");
      await reload();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao repassar", error?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  // ✔️ novo: marcar recebido para reservas "grátis"
  async function marcarRecebidoGratis() {
    if (!res?.id) return;
    try {
      setBusy(true);
      await markPickup(String(res.id));
      Alert.alert("Recebimento confirmado!");
      await reload();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao confirmar", error?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }
  if (!res) {
    return (
      <ThemedView style={{ padding: 16 }}>
        <ThemedText>Reserva não encontrada.</ThemedText>
      </ThemedView>
    );
  }

  const isFree = !!res.isFree;
  const totalText = isFree ? "Grátis" : formatBRL(Number(res.total ?? 0));

  return (
    <ThemedView style={{ padding: 16 }}>
      <ThemedText type="title">{res.itemTitle}</ThemedText>
      <ThemedText>
        {res.startDate} → {res.endDate} ({res.days} dia(s))
      </ThemedText>
      <ThemedText>Total: {totalText}</ThemedText>
      <ThemedText>Status: {res.status}</ThemedText>

      <View style={{ marginTop: 16, gap: 12 }}>
        {/* Locatário (renter) — ação depende se é grátis ou pago */}
        {isRenter && res.status === "accepted" && (
          <>
            {isFree ? (
              <TouchableOpacity onPress={marcarRecebidoGratis} disabled={busy}>
                <ThemedText type="defaultSemiBold">
                  {busy ? "Confirmando…" : "Marcar Recebido (grátis)"}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/transaction/[id]/pay",
                    params: { id: res.id },
                  })
                }
                disabled={busy}
              >
                <ThemedText type="defaultSemiBold">Pagar agora</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Dono (owner) — repasse (apenas fluxo pago legado, inalterado) */}
        {isOwner && res.status === "paid" && (
          <TouchableOpacity onPress={liberar} disabled={busy}>
            <ThemedText type="defaultSemiBold">
              {busy ? "Liberando…" : "Liberar para o dono (90%)"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}
