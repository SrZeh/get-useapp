// app/(tabs)/transactions.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
// + NOVOS IMPORTS
import { markTransactionsSeen } from "@/hooks/useTransactionsDot";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { useCallback } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  cancelWithRefund as cancelWithRefundService,
  confirmReturn,
  markPickup,
  getAccountStatus,
  createAccountLink,
} from "@/services/cloudFunctions";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LinearGradient } from "expo-linear-gradient";
import { GradientTypes } from "@/utils/gradients";
import { HapticFeedback } from "@/utils/haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Reservation, ReservationStatus } from "@/types";
import { toDate } from "@/types";
import { logger } from "@/utils/logger";

// janela de 7 dias em ms
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isRefundable(r: Reservation): boolean {
  if (r.status !== "paid") return false;
  if (r.pickedUpAt) return false; // já marcou recebido → não pode
  const paidAt = toDate(r.paidAt);
  if (!paidAt || isNaN(paidAt.getTime())) return false;
  return (Date.now() - paidAt.getTime()) <= SEVEN_DAYS_MS;
}

// chama a Cloud Function cancelWithRefund
async function cancelWithRefund(reservationId: string): Promise<void> {
  try {
    await cancelWithRefundService(reservationId);
    Alert.alert("Cancelada", "Estorno solicitado. Pode levar alguns dias para aparecer no extrato.");
  } catch (e: unknown) {
    const error = e as { message?: string };
    Alert.alert("Não foi possível cancelar", error?.message ?? "Tente novamente.");
  }
}

// --- helpers novos ---
// Mostra a mensagem de previsão de depósito conforme o método (usa campo salvo pelo webhook)
function depositMessage(paymentMethodType?: string | null) {
  if (paymentMethodType === "pix" || paymentMethodType === "boleto") {
    return "Depósito automático em até 2 dias úteis pela Stripe.";
  }
  if (paymentMethodType === "card") {
    return "Depósito automático em até 30 dias (cartão BR) pela Stripe.";
  }
  return "Depósito automático conforme regras do método de pagamento.";
}

// Garante onboarding do dono (abre o fluxo se faltar). Retorna true se já estiver ok.
async function ensureOwnerOnboarded(): Promise<boolean> {
  const st = await getAccountStatus();
  if (!st?.hasAccount || !st?.charges_enabled || !st?.payouts_enabled) {
    const { url } = await createAccountLink(
      "http://localhost:8081/",
      "http://localhost:8081/"
    );
    await WebBrowser.openBrowserAsync(url);
    return false;
  }
  return true;
}

// Pede uma foto com ImagePicker, sobe no Storage e devolve URL pública
async function pickAndUploadReturnPhoto(reservationId: string): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== "granted") {
    Alert.alert("Permissão", "Precisamos de acesso à galeria para enviar a foto.");
    return null;
  }
  const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
  if (pick.canceled || !pick.assets?.length) return null;

  const uri = pick.assets[0].uri;
  const resp = await fetch(uri);
  const blob = await resp.blob();

  const storage = getStorage();
  const path = `returns/${reservationId}/${Date.now()}.jpg`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, blob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(ref);
  return url;
}


// ---------- tipos ----------
type Res = Reservation;

// ---------- UI util ----------
function StatusBadge({ s }: { s: ReservationStatus }) {
  const map: Record<Reservation["status"], string> = {
    requested: "#f59e0b",
    accepted: "#10b981",
    rejected: "#ef4444",
    paid: "#2563eb",
    picked_up: "#0891b2",
    paid_out: "#7c3aed",
    returned: "#16a34a",
    canceled: "#6b7280",
  };
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 9999,
        backgroundColor: map[s],
      }}
    >
      <ThemedText style={{ color: "#fff" }}>{s}</ThemedText>
    </View>
  );
}

function Card({ r, actions }: { r: Res; actions?: React.ReactNode }) {
  const daysLabel = useMemo(() => {
    const n = Number(r.days ?? 0);
    return `${n} dia${n > 1 ? "s" : ""}`;
  }, [r.days]);
  const isDark = useColorScheme() === 'dark';

  const statusColors: Record<Res["status"], string[]> = {
    requested: ['#f59e0b', '#d97706'],
    accepted: ['#10b981', '#059669'],
    rejected: ['#ef4444', '#dc2626'],
    paid: ['#2563eb', '#1d4ed8'],
    picked_up: ['#0891b2', '#0e7490'],
    paid_out: ['#7c3aed', '#6d28d9'],
    returned: ['#16a34a', '#15803d'],
    canceled: ['#6b7280', '#4b5563'],
  };

  return (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden' }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <ThemedText type="title-small" style={{ fontWeight: '600', flex: 1 }}>
              {r.itemTitle ?? "Item"}
            </ThemedText>
            <LinearGradient
              colors={statusColors[r.status] || ['#6b7280', '#4b5563']}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
              }}
            >
              <ThemedText style={{ color: "#fff", fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                {r.status}
              </ThemedText>
            </LinearGradient>
          </View>

          <View style={{ gap: 6, marginBottom: 12 }}>
            <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
              📅 {r.startDate ?? "?"} → {r.endDate ?? "?"}
            </ThemedText>
            <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
              ⏱️ {daysLabel}
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: '600', color: '#96ff9a', marginTop: 4 }}>
              💰 Total: R$ {typeof r.total === 'number' ? r.total.toFixed(2) : r.total ?? "-"}
            </ThemedText>
          </View>

          {actions && (
            <View style={{ marginTop: 16, gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              {actions}
              <Button
                variant="ghost"
                onPress={() => {
                  HapticFeedback.light();
                  router.push({ pathname: "/transaction/[id]/chat", params: { id: r.id } });
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                💬 Mensagens
              </Button>
            </View>
          )}
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}

// ---------- Aba do DONO ----------
function OwnerInbox() {
  const uid = auth.currentUser?.uid ?? "";
  const [rows, setRows] = useState<Res[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "reservations"),
      where("itemOwnerUid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation));
        const keep: Reservation[] = all.filter((r) =>
          ["requested", "accepted", "paid", "picked_up", "paid_out", "returned"].includes(r.status)
        );
        setRows(keep);
      },
      (err) => logger.error("Inbox snapshot listener error", err, { code: err?.code, message: err?.message })
    );
    return () => unsub();
  }, [uid]);

  const accept = async (id: string): Promise<void> => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "reservations", id), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
        acceptedBy: uid,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Pedido aceito", "O locatário já pode efetuar o pagamento.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao aceitar", error?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string): Promise<void> => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "reservations", id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: uid,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Reserva recusada.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao recusar", error?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeReq = async (id: string): Promise<void> => {
    try {
      setBusyId(id);
      await deleteDoc(doc(db, "reservations", id));
      Alert.alert("Excluída", "Reserva removida.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao excluir", error?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  // Onboarding para receber (dono)
  async function syncStripe(): Promise<void> {
    try {
      setBusyAction("sync");
      const st = await getAccountStatus();
      if (!st?.hasAccount || !st?.charges_enabled || !st?.payouts_enabled) {
        const { url } = await createAccountLink(
          "http://localhost:8081/",
          "http://localhost:8081/"
        );
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert("Stripe", "Conta já pronta para receber.");
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Stripe", error?.message ?? String(e));
    } finally {
      setBusyAction(null);
    }
  }

  // Confirmar devolução (sem foto)
  async function confirmReturnLocal(reservationId: string): Promise<void> {
    try {
      setBusyAction(`return:${reservationId}`);
      await confirmReturn(reservationId, ""); // Empty photoUrl for non-photo returns
      Alert.alert("Devolução", "Devolução confirmada. Avaliações liberadas para o locatário.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Devolução", error?.message ?? "Falha ao confirmar devolução.");
    } finally {
      setBusyAction(null);
    }
  }

  const noteDeposit = (r: Reservation): string => {
    const t = r.paymentMethodType;
    if (t === "pix" || t === "boleto") return "Depósito automático em até 2 dias úteis pela Stripe.";
    if (t === "card") return "Depósito automático em até 30 dias (cartão BR).";
    return "Depósito automático conforme o método de pagamento.";
  };

  const btn = (label: string, onPress: () => void, disabled?: boolean) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!!disabled}
      style={{
        alignSelf: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
      {rows.length === 0 ? (
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 32, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Nenhuma reserva para mostrar.</ThemedText>
        </LiquidGlassView>
      ) : (
        rows.map((r) => (
          <Card
            key={r.id}
            r={r}
            actions={
              r.status === "requested" ? (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", gap: 12, flexWrap: 'wrap' }}>
                    {btn(busyId === r.id ? "Aceitando..." : "Aceitar", () => accept(r.id), busyId === r.id, 'primary')}
                    {btn(busyId === r.id ? "Recusando..." : "Recusar", () => reject(r.id), busyId === r.id, 'secondary')}
                  </View>
                  {btn(busyId === r.id ? "Excluindo..." : "Excluir reserva", () => removeReq(r.id), busyId === r.id, 'ghost')}
                </View>
              ) : r.status === "accepted" ? (
                <View style={{ gap: 8 }}>
                  {btn(busyAction === "sync" ? "Verificando..." : "Sincronizar conta Stripe", syncStripe, busyAction === "sync", 'primary')}
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{noteDeposit(r)}</ThemedText>
                </View>
              ) : r.status === "paid" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Pago 💙 — aguardando o locatário marcar "Recebido!".</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{noteDeposit(r)}</ThemedText>
                </View>
              ) : r.status === "picked_up" ? (
                <View style={{ gap: 8 }}>
                  {btn(
                    busyAction === `return:${r.id}` ? "Confirmando..." : "Confirmar devolução",
                    () => confirmReturnLocal(r.id),
                    busyAction === `return:${r.id}`,
                    'primary'
                  )}
                </View>
              ) : r.status === "paid_out" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Repasse ao dono concluído ✅</ThemedText>
                  {btn(
                    busyAction === `return:${r.id}` ? "Confirmando..." : "Confirmar devolução",
                    () => confirmReturnLocal(r.id),
                    busyAction === `return:${r.id}`,
                    'primary'
                  )}
                </View>
              ) : r.status === "returned" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
                </View>
              ) : null
            }
          />
        ))
      )}
    </ScrollView>
  );
}



// ---------- Aba do LOCATÁRIO ----------
function MyReservations() {
  const uid = auth.currentUser?.uid ?? "";
  const [rows, setRows] = useState<Res[]>([]);
  const [busyPickId, setBusyPickId] = useState<string | null>(null);

  

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "reservations"),
      where("renterUid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation))),
      (err) => logger.error("My reservations snapshot listener error", err, { code: err?.code, message: err?.message })
    );
    return () => unsub();
  }, [uid]);

  const removeMine = async (id: string, status: ReservationStatus): Promise<void> => {
    if (!["requested", "rejected", "canceled"].includes(status)) {
      Alert.alert("Ação não permitida", "Só é possível excluir pendentes, recusadas ou canceladas.");
      return;
    }
    try {
      await deleteDoc(doc(db, "reservations", id));
      Alert.alert("Excluída", "Reserva removida da sua lista.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao excluir", error?.message ?? String(e));
    }
  };

  async function markReceived(reservationId: string): Promise<void> {
    try {
      setBusyPickId(reservationId);
      await markPickup(reservationId);
      Alert.alert("Recebido!", "Após o uso, lembre-se de devolver o item no prazo e avaliar, avaliações tornam nossa comunidade segura e confiável!");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Não foi possível marcar", error?.message ?? String(e));
    } finally {
      setBusyPickId(null);
    }
  }

  
  const btn = (label: string, onPress: () => void, disabled?: boolean, variant: 'primary' | 'secondary' | 'ghost' = 'secondary') => (
    <Button
      variant={variant}
      onPress={onPress}
      disabled={!!disabled}
      style={{ alignSelf: "flex-start" }}
      textStyle={{ fontSize: 14 }}
    >
      {label}
    </Button>
  );

  return (
    <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
      {rows.length === 0 ? (
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 32, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>Você ainda não fez reservas.</ThemedText>
        </LiquidGlassView>
      ) : (
        rows.map((r) => (
          <Card
            key={r.id}
            r={r}
            actions={
              r.status === "accepted" && !r.paidAt ? (
                btn("Pagar", () =>
                  router.push({ pathname: "/transaction/[id]/pay", params: { id: r.id } }),
                  false,
                  'primary'
                )
              ) : r.status === "paid" ? (
                <View style={{ gap: 8 }}>
                  {btn(
                    busyPickId === r.id ? "Processando..." : "Recebido!",
                    () => markReceived(r.id),
                    busyPickId === r.id,
                    'primary'
                  )}

                  {/* NOVO: cancelar com estorno enquanto for elegível */}
                  {isRefundable(r) && btn(
                    "Cancelar e pedir estorno",
                    () => cancelWithRefund(r.id),
                    false,
                    'secondary'
                  )}
                  {!isRefundable(r) && (
                    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                      Estorno disponível por até 7 dias após o pagamento e antes de marcar "Recebido!".
                    </ThemedText>
                  )}
                </View>
                
              ) : r.status === "rejected" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText style={{ color: "#ef4444" }}>Seu pedido foi recusado</ThemedText>
                  {btn("Excluir", () => removeMine(r.id, r.status), false, 'ghost')}
                </View>
              ) : ["requested", "canceled"].includes(r.status) ? (
                btn("Excluir", () => removeMine(r.id, r.status), false, 'ghost')
              ) : r.status === "picked_up" ? (
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                  Obrigado! A devolução agora pode ser confirmada pelo dono.
                </ThemedText>
              ) : r.status === "returned" && (r.reviewsOpen?.renterCanReviewOwner ?? true) ? (
                btn("Avaliar experiência", () =>
                  router.push({ pathname: "/review/[transactionId]", params: { transactionId: r.id } }),
                  false,
                  'primary'
                )
              ) : r.status === "paid_out" ? (
                <ThemedText type="defaultSemiBold">Pagamento repassado ao dono ✅</ThemedText>
              ) : null
            }
          />
        ))
      )}
    </ScrollView>
  );
}

// ---------- tela ----------
export default function TransactionsScreen() {
  useFocusEffect(
    useCallback(() => {
      // marca como visto sempre que a tela entra em foco
      markTransactionsSeen();
      return () => {};
    }, [])
  );
  const [tab, setTab] = useState<"owner" | "renter">("owner");
  const tabBtn = (k: "owner" | "renter", label: string) => (
    <TouchableOpacity
      onPress={() => setTab(k)}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        opacity: tab === k ? 1 : 0.7,
      }}
    >
      <ThemedText type={tab === k ? "defaultSemiBold" : "default"}>{label}</ThemedText>
    </TouchableOpacity>
  );
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 12, padding: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.selection();
            setTab("owner");
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: tab === "owner" 
              ? (isDark ? 'rgba(150, 255, 154, 0.2)' : 'rgba(150, 255, 154, 0.15)')
              : 'transparent',
            borderWidth: tab === "owner" ? 2 : 1,
            borderColor: tab === "owner" ? '#96ff9a' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          }}
        >
          <ThemedText 
            type={tab === "owner" ? "defaultSemiBold" : "default"} 
            style={{ textAlign: 'center', color: tab === "owner" ? '#96ff9a' : undefined }}
          >
            Recebidas
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.selection();
            setTab("renter");
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: tab === "renter" 
              ? (isDark ? 'rgba(150, 255, 154, 0.2)' : 'rgba(150, 255, 154, 0.15)')
              : 'transparent',
            borderWidth: tab === "renter" ? 2 : 1,
            borderColor: tab === "renter" ? '#96ff9a' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          }}
        >
          <ThemedText 
            type={tab === "renter" ? "defaultSemiBold" : "default"} 
            style={{ textAlign: 'center', color: tab === "renter" ? '#96ff9a' : undefined }}
          >
            Minhas reservas
          </ThemedText>
        </TouchableOpacity>
      </View>
      {tab === "owner" ? <OwnerInbox /> : <MyReservations />}
    </ThemedView>
  );
}
