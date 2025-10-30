// app/reservations/[resId].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { markPickup, releasePayoutToOwner } from "@/services/cloudFunctions";
import { formatBRL } from "@/utils";
import type { Reservation } from "@/types";
import { Spacing } from "@/constants/spacing";
import { useTransactionsStore } from "@/stores/transactionsStore";

export default function ReservationDetail() {
  const { resId } = useLocalSearchParams<{ resId: string }>();
  const [res, setRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const uid = auth.currentUser?.uid ?? null;
  const isOwner = !!uid && res?.itemOwnerUid === uid;
  const isRenter = !!uid && res?.renterUid === uid;

  // Get reservation from store (cached, no duplicate query!)
  const getTransaction = useTransactionsStore((state) => state.getTransaction);

  // helper para recarregar o doc (evita conflito de nome "refresh")
  async function reload() {
    try {
      const transaction = await getTransaction(String(resId), false); // Use cache first
      if (transaction && 'itemId' in transaction) {
        // It's a reservation
        setRes(transaction as Reservation);
      } else {
        setRes(null);
      }
    } catch (error) {
      console.error('Error loading reservation:', error);
      setRes(null);
    }
  }

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
  }, [resId, getTransaction]);

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
      <ThemedView style={{ padding: Spacing.sm }}>
        <ThemedText>Reserva não encontrada.</ThemedText>
      </ThemedView>
    );
  }

  const isFree = !!res.isFree;
  const totalText = isFree ? "Grátis" : formatBRL(Number(res.total ?? 0));

  return (
    <ThemedView style={{ padding: Spacing.sm }}>
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
