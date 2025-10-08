// app/item/[id].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

type Item = {
  id: string;
  title: string;
  description?: string;
  photos?: string[];
  category?: string;
  condition?: string;
  dailyRate?: number;
  minRentalDays?: number;
  city?: string;
  neighborhood?: string;
  ratingAvg?: number;
  ownerUid?: string;
  ratingCount?: number;
  ratingSum?: number;
  ownerRatingCount?: number;
  ownerRatingSum?: number;
};

type Review = {
  id: string;
  renterUid: string;
  reservationId: string;
  rating: number;
  comment?: string;
  createdAt?: any;
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === "dark";
  const uid = auth.currentUser?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);

  // --- calendar state ---
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [startISO, setStartISO] = useState<string | null>(null);
  const [endISOInc, setEndISOInc] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  // --- reviews ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleRes, setEligibleRes] = useState<{ id: string; label: string }[]>([]);
  const [selectedResId, setSelectedResId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const inputStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#fff" : "#111827",
      borderColor: isDark ? "#374151" : "#d1d5db",
      backgroundColor: isDark ? "#111827" : "#fff",
    }),
    [isDark]
  );
  const placeholderColor = isDark ? "#9aa0a6" : "#6b7280";

  // helpers de data
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayLocalISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const nextDay = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  };
  const diffDaysExclusive = (start: string, endExclusive: string) => {
    const a = new Date(`${start}T00:00:00Z`).getTime();
    const b = new Date(`${endExclusive}T00:00:00Z`).getTime();
    return Math.max(0, Math.round((b - a) / 86_400_000));
  };
  const enumerateInclusive = (aISO: string, bISO: string) => {
    const out: string[] = [];
    let t = new Date(`${aISO}T00:00:00Z`).getTime();
    const end = new Date(`${bISO}T00:00:00Z`).getTime();
    while (t <= end) {
      const d = new Date(t);
      out.push(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`);
      t += 86_400_000;
    }
    return out;
  };

  // Carrega item
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "items", id));
        if (!snap.exists()) {
          Alert.alert("Item", "Item não encontrado.");
          router.back();
          return;
        }
        setItem({ id: snap.id, ...(snap.data() as any) });
      } catch (e: any) {
        Alert.alert("Erro", e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Carrega dias bloqueados (paid)
  useEffect(() => {
    const qCal = collection(db, "items", id, "bookedDays");
    const unsub = onSnapshot(
      qCal,
      (snap) => {
        const s = new Set<string>();
        snap.forEach((d) => s.add(d.id)); // yyyy-mm-dd
        setBooked(s);
      },
      (err) => console.log("BOOKED DAYS ERROR", err?.code, err?.message)
    );
    return () => unsub();
  }, [id]);

  // Marcações do calendário (booked + seleção)
  useEffect(() => {
    const md: Record<string, any> = {};
    booked.forEach((d) => {
      md[d] = { ...(md[d] || {}), disabled: true, disableTouchEvent: true };
    });
    if (startISO && endISOInc) {
      const days = enumerateInclusive(startISO, endISOInc);
      days.forEach((d, idx) => {
        md[d] = {
          ...(md[d] || {}),
          selected: true,
          startingDay: idx === 0,
          endingDay: idx === days.length - 1,
        };
      });
    } else if (startISO) {
      md[startISO] = { ...(md[startISO] || {}), selected: true, startingDay: true, endingDay: true };
    }
    setMarkedDates(md);
  }, [booked, startISO, endISOInc]);

  // Reviews em tempo real
  useEffect(() => {
    const qReviews = query(collection(db, "items", id, "reviews"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(
      qReviews,
      (snap) => {
        const list: Review[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setReviews(list);
      },
      (err) => console.log("REVIEWS ERROR", err?.code, err?.message)
    );
    return () => unsub();
  }, [id]);

  // Reservas elegíveis do usuário p/ avaliar
  useEffect(() => {
    (async () => {
      if (!uid) return;
      try {
        const qRes = query(
          collection(db, "reservations"),
          where("renterUid", "==", uid),
          where("itemId", "==", id),
          // ajuste se seu fluxo usar outros status para "concluída"
          where("status", "in", ["returned", "closed"])
        );
        const snap = await getDocs(qRes);
        const list: { id: string; label: string }[] = [];
        snap.forEach((d) => {
          const r: any = d.data();
          const dateLabel = r.startDate && r.endDate ? `(${r.startDate} → ${r.endDate})` : "";
          list.push({ id: d.id, label: `#${d.id.slice(0, 6)} ${dateLabel}` });
        });
        setEligibleRes(list);
        if (list.length === 1) setSelectedResId(list[0].id);
      } catch {}
    })();
  }, [uid, id]);

  // interação do calendário
  function onDayPress(day: DateData) {
    const d = day.dateString; // yyyy-mm-dd
    if (!startISO || (startISO && endISOInc)) {
      if (booked.has(d)) return;
      setStartISO(d);
      setEndISOInc(null);
      return;
    }
    let a = startISO;
    let b = d;
    if (b < a) [a, b] = [b, a];
    const span = enumerateInclusive(a, b);
    if (span.some((x) => booked.has(x))) {
      Alert.alert("Indisponível", "O intervalo selecionado inclui dias já ocupados.");
      return;
    }
    setStartISO(a);
    setEndISOInc(b);
  }

  function calcAvg(sum?: number, count?: number) {
    if (!count || !sum) return null;
    if (count <= 0) return null;
    return Math.max(0, Math.min(5, sum / count));
  }
  function renderStars(avg: number) {
    const rounded = Math.round(avg * 2) / 2;
    const full = Math.floor(rounded);
    const half = rounded - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
  }

  // cálculo resumo reserva
  const endExclusive = endISOInc ? nextDay(endISOInc) : null;
  const daysCount = startISO && endExclusive ? diffDaysExclusive(startISO, endExclusive) : 0;
  const minDays = item?.minRentalDays ?? 1;
  const rate = item?.dailyRate ?? 0;
  const total = daysCount > 0 ? rate * daysCount : 0;

  // estrelas
  const Stars = ({ value }: { value: number }) => {
    const rounded = Math.round(value || 0);
    return <ThemedText style={{ fontSize: 18 }}>{"★".repeat(rounded).padEnd(5, "☆")}</ThemedText>;
  };
  function StarInput({ n }: { n: number }) {
    const active = n <= rating;
    return (
      <TouchableOpacity onPress={() => setRating(n)}>
        <ThemedText style={{ fontSize: 24 }}>{active ? "★" : "☆"}</ThemedText>
      </TouchableOpacity>
    );
  }

  async function submitReview() {
    if (!uid) return Alert.alert("Sessão", "Faça login para avaliar.");
    if (!selectedResId) return Alert.alert("Avaliação", "Selecione a reserva.");
    if (rating < 1 || rating > 5) return Alert.alert("Avaliação", "Nota de 1 a 5.");

    try {
      await addDoc(collection(db, "items", id, "reviews"), {
        renterUid: uid,
        reservationId: selectedResId,
        rating,
        comment: comment?.trim() ?? "",
        createdAt: serverTimestamp(),
      });

      const itemRef = doc(db, "items", id);
      await runTransaction(db, async (trx) => {
        const snap = await trx.get(itemRef);
        if (!snap.exists()) throw new Error("Item não encontrado");
        const it = snap.data() as any;
        const count = (it.ratingCount ?? 0) + 1;
        const sum = (it.ratingAvg ?? 0) * (it.ratingCount ?? 0) + rating;
        const avg = Number((sum / count).toFixed(2));
        trx.update(itemRef, {
          ratingAvg: avg,
          ratingCount: count,
          lastReviewSnippet: (comment ?? "").slice(0, 120),
          updatedAt: serverTimestamp(),
        });
      });

      setComment("");
      setRating(5);
      Alert.alert("Obrigado!", "Sua avaliação foi registrada.");
    } catch (e: any) {
      Alert.alert("Erro ao enviar avaliação", e?.message ?? String(e));
    }
  }

  // ✅ PATCH: força token atualizado e checa e-mail verificado antes de criar a reserva
  async function requestReservation() {
    const u = auth.currentUser;
    if (!u) return Alert.alert("Sessão", "Faça login para reservar.");
    if (!item) return;
    if (!startISO || !endExclusive) return Alert.alert("Datas", "Selecione check-in e check-out.");
    if (daysCount < minDays) return Alert.alert("Mínimo", `Este item exige ao menos ${minDays} dia(s).`);
    if (Array.from(enumerateInclusive(startISO, endISOInc!)).some((x) => booked.has(x))) {
      return Alert.alert("Indisponível", "O intervalo inclui dias já ocupados.");
    }

    try {
      // garante que o token já contenha email_verified=true
      await u.reload();
      if (!u.emailVerified) {
        Alert.alert(
          "E-mail não verificado",
          "Confirme seu e-mail para solicitar reservas."
        );
        router.push("/(auth)/verify-email");
        return;
      }
      await u.getIdToken(true); // 🔑 força refresh do token para as Regras

      await addDoc(collection(db, "reservations"), {
        itemId: item.id,
        itemTitle: item.title ?? "",
        itemOwnerUid: item.ownerUid ?? "",
        renterUid: u.uid,                  // use o UID fresco
        startDate: startISO,               // inclusivo
        endDate: endExclusive,             // exclusivo (check-out)
        days: daysCount,
        total: total,
        status: "requested",               // exigido pelas regras
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Pedido enviado!", "Aguarde o dono aceitar para efetuar o pagamento.");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? String(e));
    }
  }

  if (loading || !item) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando item…</ThemedText>
      </ThemedView>
    );
  }

  const todayISO = todayLocalISO();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* HEADER DO ITEM */}
          {item.photos?.[0] && (
            <Image
              source={{ uri: item.photos[0] }}
              style={{ width: "100%", height: 220, borderRadius: 12, marginBottom: 12 }}
            />
          )}
          <ThemedText type="title">{item.title}</ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Stars value={item.ratingAvg ?? 0} />
            {!!item.ratingCount && <ThemedText>({item.ratingCount})</ThemedText>}
          </View>
          {!!item.category && (
            <View style={{ marginTop: 6 }}>
              <ThemedText style={{ opacity: 0.8 }}>{item.category}</ThemedText>
            </View>
          )}
          {!!item.city && (
            <View style={{ marginTop: 2 }}>
              <ThemedText style={{ opacity: 0.8 }}>
                {item.city} {item.neighborhood ? `• ${item.neighborhood}` : ""}
              </ThemedText>
            </View>
          )}
          {!!item.description && (
            <ThemedText style={{ marginTop: 12 }}>{item.description}</ThemedText>
          )}

          {/* CALENDÁRIO / RESERVA */}
          <View
            style={{
              marginTop: 20,
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
              borderColor: isDark ? "#374151" : "#fff",
              backgroundColor: isDark ? "#0b1220" : "#40ef47",
            }}
          >
            <ThemedText type="subtitle">Escolha as datas</ThemedText>
            <ThemedText style={{ marginTop: 6, opacity: 0.7 }}>
              Check-in (seleção do primeiro dia) e Check-out (dia seguinte ao último pernoite).
            </ThemedText>

            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="period"
              current={todayISO}
              minDate={todayISO}
              hideExtraDays
              enableSwipeMonths
              disableArrowLeft
              theme={{
                calendarBackground: isDark ? "#0b1220" : "#fff",
                textSectionTitleColor: isDark ? "#9aa0a6" : "#6b7280",
                dayTextColor: isDark ? "#e5e7eb" : "#111827",
                monthTextColor: isDark ? "#e5e7eb" : "#111827",
                todayTextColor: isDark ? "#93c5fd" : "#2563eb",
                selectedDayTextColor: "#fff",
              }}
              style={{ marginTop: 10, borderRadius: 12 }}
            />

            <View style={{ marginTop: 12, gap: 6 }}>
              <ThemedText>
                Check-in: {startISO ?? "—"}   •   Check-out: {endExclusive ?? "—"}
              </ThemedText>
              <ThemedText>
                Dias: {daysCount} {daysCount === 1 ? "dia" : "dias"} {item.minRentalDays ? `(mín: ${minDays})` : ""}
              </ThemedText>
              <ThemedText>Diária: {item.dailyRate != null ? `R$ ${item.dailyRate}` : "—"}</ThemedText>
              <ThemedText type="defaultSemiBold">Total: {total ? `R$ ${total}` : "—"}</ThemedText>
            </View>

            <TouchableOpacity
              onPress={requestReservation}
              disabled={!uid || !startISO || !endExclusive || daysCount < minDays}
              style={{
                alignSelf: "flex-start",
                marginTop: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#d1d5db",
                backgroundColor: isDark ? "#111827" : "#f9fafb",
                opacity: (!uid || !startISO || !endExclusive || daysCount < minDays) ? 0.5 : 1,
              }}
            >
              <ThemedText type="defaultSemiBold">Solicitar reserva</ThemedText>
            </TouchableOpacity>
          </View>

          {/* FORM DE AVALIAÇÃO */}
          <View
            style={{
              marginTop: 20,
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
              borderColor: isDark ? "#374151" : "#e5e7eb",
              backgroundColor: isDark ? "#0b1220" : "#fff",
            }}
          >
            <ThemedText type="subtitle">Avaliar este item</ThemedText>

            {uid ? (
              eligibleRes.length > 0 ? (
                <>
                  <ThemedText style={{ marginTop: 10, opacity: 0.8 }}>
                    Selecione a reserva que você utilizou:
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {eligibleRes.map((r) => {
                      const active = selectedResId === r.id;
                      return (
                        <TouchableOpacity
                          key={r.id}
                          onPress={() => setSelectedResId(active ? "" : r.id)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: active
                              ? isDark ? "#2563eb" : "#1d4ed8"
                              : "transparent",
                            borderColor: active
                              ? "transparent"
                              : isDark ? "#374151" : "#d1d5db",
                          }}
                        >
                          <ThemedText style={{ color: active ? "#fff" : undefined }}>
                            {r.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <ThemedText style={{ marginTop: 14, opacity: 0.8 }}>Sua nota:</ThemedText>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarInput key={n} n={n} />
                    ))}
                  </View>

                  <TextInput
                    placeholder="Escreva um comentário (opcional)"
                    placeholderTextColor={placeholderColor}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    style={[inputStyle, { marginTop: 10, minHeight: 80, textAlignVertical: "top" }]}
                  />

                  <TouchableOpacity
                    onPress={submitReview}
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDark ? "#374151" : "#d1d5db",
                      backgroundColor: isDark ? "#111827" : "#f9fafb",
                    }}
                  >
                    <ThemedText type="defaultSemiBold">Enviar avaliação</ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <ThemedText style={{ marginTop: 8 }}>
                  Você poderá avaliar depois de concluir a devolução de uma reserva deste item.
                </ThemedText>
              )
            ) : (
              <ThemedText style={{ marginTop: 8 }}>
                Faça login para avaliar este item.
              </ThemedText>
            )}
          </View>

          {/* LISTA DE REVIEWS */}
          <View style={{ marginTop: 16 }}>
            <ThemedText type="subtitle">Comentários recentes</ThemedText>
            {reviews.length === 0 ? (
              <ThemedText style={{ marginTop: 8, opacity: 0.8 }}>
                Ainda não há avaliações para este item.
              </ThemedText>
            ) : (
              reviews.map((r) => (
                <View
                  key={r.id}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                    backgroundColor: isDark ? "#0b1220" : "#fff",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Stars value={r.rating} />
                    <ThemedText style={{ opacity: 0.7 }}>
                      {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : ""}
                    </ThemedText>
                  </View>
                  {!!r.comment && (
                    <ThemedText style={{ marginTop: 6 }}>{r.comment}</ThemedText>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
