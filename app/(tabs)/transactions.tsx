// app/(tabs)/transactions.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
  const [busyLogin, setBusyLogin] = useState(false);
  const [busyPayoutId, setBusyPayoutId] = useState<string | null>(null);

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

  // abre painel Express do dono
  async function openStripeDashboard() {
    try {
      setBusyLogin(true);
      const { url } = await callFn<{}, { url: string }>("createExpressLoginLink", {});
      await WebBrowser.openBrowserAsync(url);
    } catch (e: any) {
      Alert.alert("Stripe", e?.message ?? String(e));
    } finally {
      setBusyLogin(false);
    }
  }

  async function payout(reservationId: string) {
    try {
      setBusyPayoutId(reservationId);
      await callFn<{ reservationId: string }, any>("releasePayoutToOwner", { reservationId });
      Alert.alert("Saque solicitado", "Transferência enviada pela Stripe.");
    } catch (e: any) {
      Alert.alert("Não foi possível sacar", e?.message ?? String(e));
    } finally {
      setBusyPayoutId(null);
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
                    {btn(
                      busyId === r.id ? "..." : "Aceitar",
                      () => accept(r.id),
                      busyId === r.id
                    )}
                    {btn(
                      busyId === r.id ? "..." : "Recusar",
                      () => reject(r.id),
                      busyId === r.id
                    )}
                  </View>
                  {btn(
                    busyId === r.id ? "..." : "Excluir reserva",
                    () => removeReq(r.id),
                    busyId === r.id
                  )}
                </View>
              ) : r.status === "accepted" ? (
                <ThemedText>Esperando pagamento na plataforma…</ThemedText>
              ) : r.status === "paid" ? (
                <ThemedText>Pago 💙 — aguardando o locatário marcar "Recebido!".</ThemedText>
              ) : r.status === "picked_up" ? (
                <View style={{ gap: 12 }}>
                  {btn(
                    busyPayoutId === r.id ? "..." : "Sacar 90%",
                    () => payout(r.id),
                    busyPayoutId === r.id
                  )}
                  {btn(busyLogin ? "..." : "Abrir Stripe", () => openStripeDashboard(), busyLogin)}
                </View>
              ) : r.status === "paid_out" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Pago ao dono ✅</ThemedText>
                  {btn(busyLogin ? "..." : "Abrir Stripe", () => openStripeDashboard(), busyLogin)}
                </View>
              ) : r.status === "returned" ? (
                <View style={{ gap: 8 }}>
                  <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
                  {btn(busyLogin ? "..." : "Abrir Stripe", () => openStripeDashboard(), busyLogin)}
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
      Alert.alert("Recebido!", "Agora o dono já pode sacar os 90%.");
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
                <TouchableOpacity
                  onPress={() => callFn<{reservationId:string}, any>("releasePayoutToOwner", { reservationId: r.id })}
                >
                  <ThemedText type="defaultSemiBold">Sacar</ThemedText>
                </TouchableOpacity>
              ) : r.status === "paid_out" ? (
                <ThemedText type="defaultSemiBold">Já sacado</ThemedText>
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
