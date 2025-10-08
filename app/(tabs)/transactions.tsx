// app/(tabs)/transactions.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
// + NOVOS IMPORTS
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
import { getFunctions, httpsCallable } from "firebase/functions";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";

// ---------- helper para Cloud Functions ----------
async function callFn<TReq, TRes>(name: string, data: TReq): Promise<TRes> {
  const fns = getFunctions(undefined, "southamerica-east1");
  const fn = httpsCallable<TReq, TRes>(fns, name);
  const res = await fn(data);
  return res.data;
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
  const st = await callFn<{}, { hasAccount: boolean; charges_enabled: boolean; payouts_enabled: boolean }>("getAccountStatus", {});
  if (!st?.hasAccount || !st?.charges_enabled || !st?.payouts_enabled) {
    const { url } = await callFn<{ refreshUrl: string; returnUrl: string }, { url: string }>("createAccountLink", {
      // pode apontar para sua tela/sucesso local
      refreshUrl: "http://localhost:8081/",
      returnUrl: "http://localhost:8081/",
    });
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
type Res = {
  id: string;
  itemTitle?: string;
  startDate?: string; // inclusivo
  endDate?: string;   // exclusivo
  days?: number;
  total?: number | string;
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "paid"
    | "picked_up"
    | "paid_out"
    | "returned"
    | "canceled";
  renterUid?: string;
  itemOwnerUid?: string;
  createdAt?: any;
  paidAt?: any;
  paymentMethodType?: string | null; 
  pickedUpAt?: any;
};

// ---------- UI util ----------
function StatusBadge({ s }: { s: Res["status"] }) {
  const map: Record<Res["status"], string> = {
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

  return (
    <View style={{ borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }}>
      <ThemedText type="subtitle">{r.itemTitle ?? "Item"}</ThemedText>
      <ThemedText>
        {r.startDate ?? "?"} → {r.endDate ?? "?"} ({daysLabel})
      </ThemedText>
      <ThemedText>Total: R$ {r.total ?? "-"}</ThemedText>
      <View style={{ marginTop: 8 }}>
        <StatusBadge s={r.status} />
      </View>

      <View style={{ marginTop: 10, gap: 12 }}>
        {actions}
        {/* Chat da reserva */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/transaction/[id]/chat", params: { id: r.id } as any })}
          style={{ paddingVertical: 8 }}
        >
          <ThemedText>Mensagens</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
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
        const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Res[];
        const keep: Res[] = all.filter((r) =>
          ["requested", "accepted", "paid", "picked_up", "paid_out", "returned"].includes(r.status)
        );
        setRows(keep);
      },
      (err) => console.log("INBOX ERROR", err?.code, err?.message)
    );
    return () => unsub();
  }, [uid]);

  const accept = async (id: string) => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "reservations", id), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
        acceptedBy: uid,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Pedido aceito", "O locatário já pode efetuar o pagamento.");
    } catch (e: any) {
      Alert.alert("Falha ao aceitar", e?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "reservations", id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: uid,
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Reserva recusada.");
    } catch (e: any) {
      Alert.alert("Falha ao recusar", e?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeReq = async (id: string) => {
    try {
      setBusyId(id);
      await deleteDoc(doc(db, "reservations", id));
      Alert.alert("Excluída", "Reserva removida.");
    } catch (e: any) {
      Alert.alert("Falha ao excluir", e?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  };

  // Onboarding para receber (dono)
  async function syncStripe() {
    try {
      setBusyAction("sync");
      const st = await callFn<{}, { hasAccount: boolean; charges_enabled: boolean; payouts_enabled: boolean }>("getAccountStatus", {});
      if (!st?.hasAccount || !st?.charges_enabled || !st?.payouts_enabled) {
        const { url } = await callFn<{ refreshUrl: string; returnUrl: string }, { url: string }>("createAccountLink", {
          refreshUrl: "http://localhost:8081/",
          returnUrl: "http://localhost:8081/",
        });
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert("Stripe", "Conta já pronta para receber.");
      }
    } catch (e: any) {
      Alert.alert("Stripe", e?.message ?? String(e));
    } finally {
      setBusyAction(null);
    }
  }

  // Confirmar devolução (sem foto)
  async function confirmReturn(reservationId: string) {
    try {
      setBusyAction(`return:${reservationId}`);
      await callFn<{ reservationId: string }, any>("confirmReturn", { reservationId });
      Alert.alert("Devolução", "Devolução confirmada. Avaliações liberadas para o locatário.");
    } catch (e: any) {
      Alert.alert("Devolução", e?.message ?? "Falha ao confirmar devolução.");
    } finally {
      setBusyAction(null);
    }
  }

  const noteDeposit = (r: Res) => {
    const t = (r as any).paymentMethodType as string | undefined;
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
    <ScrollView style={{ padding: 16 }}>
      {rows.length === 0 ? (
        <ThemedText>Nenhuma reserva para mostrar.</ThemedText>
      ) : (
        rows.map((r) => (
          <Card
            key={r.id}
            r={r}
            actions={
              r.status === "requested" ? (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    {btn(busyId === r.id ? "..." : "Aceitar", () => accept(r.id), busyId === r.id)}
                    {btn(busyId === r.id ? "..." : "Recusar", () => reject(r.id), busyId === r.id)}
                  </View>
                  {btn(busyId === r.id ? "..." : "Excluir reserva", () => removeReq(r.id), busyId === r.id)}
                </View>
              ) : r.status === "accepted" ? (
                <View style={{ gap: 8 }}>
                  {btn(busyAction === "sync" ? "Verificando..." : "Sincronizar conta Stripe para receber", syncStripe, busyAction === "sync")}
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
                    () => confirmReturn(r.id),
                    busyAction === `return:${r.id}`
                  )}
                </View>
              ) : r.status === "paid_out" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Repasse ao dono concluído ✅</ThemedText>
                  {btn(
                    busyAction === `return:${r.id}` ? "Confirmando..." : "Confirmar devolução",
                    () => confirmReturn(r.id),
                    busyAction === `return:${r.id}`
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
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.log("MY RES ERROR", err?.code, err?.message)
    );
    return () => unsub();
  }, [uid]);

  const removeMine = async (id: string, status: Res["status"]) => {
    if (!["requested", "rejected", "canceled"].includes(status)) {
      Alert.alert("Ação não permitida", "Só é possível excluir pendentes, recusadas ou canceladas.");
      return;
    }
    try {
      await deleteDoc(doc(db, "reservations", id));
      Alert.alert("Excluída", "Reserva removida da sua lista.");
    } catch (e: any) {
      Alert.alert("Falha ao excluir", e?.message ?? String(e));
    }
  };

  async function markReceived(reservationId: string) {
    try {
      setBusyPickId(reservationId);
      await callFn<{ reservationId: string }, any>("markPickup", { reservationId });
      Alert.alert("Recebido!", "Após o uso, lembre-se de devolver o item no prazo e avaliar, avaliações tornam nossa comunidade segura e confiável!");
    } catch (e: any) {
      Alert.alert("Não foi possível marcar", e?.message ?? String(e));
    } finally {
      setBusyPickId(null);
    }
  }

  
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
    <ScrollView style={{ padding: 16 }}>
      {rows.length === 0 ? (
        <ThemedText>Você ainda não fez reservas.</ThemedText>
      ) : (
        rows.map((r) => (
          <Card
            key={r.id}
            r={r}
        actions={
  r.status === "accepted" && !r.paidAt ? (
    btn("Pagar", () =>
      router.push({ pathname: "/transaction/[id]/pay", params: { id: r.id } as any })
    )
  ) : r.status === "paid" ? (
    btn(
      busyPickId === r.id ? "..." : "Recebido!",
      () => markReceived(r.id),
      busyPickId === r.id
    )
  ) : r.status === "rejected" ? (
    <View style={{ gap: 8 }}>
      <ThemedText style={{ color: "#ef4444" }}>Seu pedido foi recusado</ThemedText>
      {btn("Excluir", () => removeMine(r.id, r.status))}
    </View>
  ) : ["requested", "canceled"].includes(r.status) ? (
    btn("Excluir", () => removeMine(r.id, r.status))
  ) : r.status === "picked_up" ? (
    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
      Obrigado! A devolução agora pode ser confirmada pelo dono.
    </ThemedText>
  ) : r.status === "returned" && ((r as any).reviewsOpen?.renterCanReviewOwner ?? true) ? (
    btn("Avaliar experiência", () =>
      router.push({ pathname: "/review/[transactionId]", params: { transactionId: r.id } as any })
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
  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 12, padding: 16 }}>
        {tabBtn("owner", "Recebidas")}
        {tabBtn("renter", "Minhas reservas")}
      </View>
      {tab === "owner" ? <OwnerInbox /> : <MyReservations />}
    </ThemedView>
  );
}
