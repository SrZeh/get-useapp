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
  where
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { HapticFeedback } from "@/utils/haptics";
import { AnimatedCard } from "@/components/AnimatedCard";
import { Calendar, DateData } from "react-native-calendars";
import type { Item, Review } from "@/types";
import { calcAvg, renderStars } from "@/utils/ratings";
import { logger } from "@/utils/logger";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
  const uid = auth.currentUser?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [busyChat, setBusyChat] = useState(false);                // ⬅️ ADD

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
      borderRadius: 16,
      padding: 16,
      fontSize: 17, // iOS body
      color: palette.text,
      borderColor: palette.border,
      backgroundColor: palette.inputBg,
    }),
    [palette]
  );
  const placeholderColor = palette.textTertiary;

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
        setItem({ id: snap.id, ...(snap.data() as Partial<Item>) } as Item);
      } catch (e: unknown) {
        const error = e as { message?: string };
        Alert.alert("Erro", error?.message ?? String(e));
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
      (err) => logger.error("Booked days snapshot listener error", err, { code: err?.code, message: err?.message })
    );
    return () => unsub();
  }, [id]);

  // Marcações do calendário (booked + seleção)
  useEffect(() => {
    const md: Record<string, { disabled?: boolean; disableTouchEvent?: boolean; selected?: boolean; startingDay?: boolean; endingDay?: boolean }> = {};
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
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Partial<Review>) } as Review));
        setReviews(list);
      },
      (err) => logger.error("Reviews snapshot listener error", err, { code: err?.code, message: err?.message })
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
          const r = d.data() as { startDate?: string; endDate?: string };
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

  // cálculo resumo reserva
  const endExclusive = endISOInc ? nextDay(endISOInc) : null;
  const daysCount = startISO && endExclusive ? diffDaysExclusive(startISO, endExclusive) : 0;
  const minDays = item?.minRentalDays ?? 1;
  const rate = item?.isFree ? 0 : (item?.dailyRate ?? 0);  
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
        const it = snap.data() as Partial<Item>;
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
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro ao enviar avaliação", error?.message ?? String(e));
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
        isFree: !!item.isFree,
        status: "requested",               // exigido pelas regras
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Pedido enviado!", "Aguarde o dono aceitar para efetuar o pagamento.");
      router.back();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro", error?.message ?? String(e));
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
      <ThemedView style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* HEADER DO ITEM */}
          <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden', marginBottom: 24 }}>
            {item.photos?.[0] && (
              <ExpoImage
                source={{ uri: item.photos[0] }}
                style={{ width: "100%", height: 280 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                recyclingKey={item.photos[0]}
              />
            )}
            <View style={{ padding: 20 }}>
              <ThemedText type="title-1" style={{ marginBottom: 12, fontWeight: '600' }}>
                {item.title}
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Stars value={item.ratingAvg ?? 0} />
                {!!item.ratingCount && (
                  <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
                    ({item.ratingCount} avaliações)
                  </ThemedText>
                )}
              </View>
              {!!item.category && (
                <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ marginBottom: 8 }}>
                  {item.category}
                </ThemedText>
              )}
              {!!item.city && (
                <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  📍 {item.city} {item.neighborhood ? `• ${item.neighborhood}` : ""}
                </ThemedText>
              )}
              {!!item.description && (
                <ThemedText type="body" style={{ marginTop: 16 }} className="text-light-text-secondary dark:text-dark-text-secondary">
                  {item.description}
                </ThemedText>
              )}
            </View>
          </LiquidGlassView>

          {/* CALENDÁRIO / RESERVA */}
          <LiquidGlassView
            intensity="standard"
            cornerRadius={20}
            style={{ padding: 20, marginBottom: 24 }}
          >
            <ThemedText type="title-2" style={{ marginBottom: 8, fontWeight: '600' }}>
              Escolha as datas
            </ThemedText>
            <ThemedText type="callout" style={{ marginBottom: 16 }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
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
                calendarBackground: palette.background,
                textSectionTitleColor: palette.textTertiary,
                dayTextColor: palette.text,
                monthTextColor: palette.text,
                todayTextColor: palette.tint,
                selectedDayTextColor: "#fff",
                selectedDayBackgroundColor: palette.tint,
                arrowColor: palette.tint,
                disabledDayTextColor: palette.textTertiary,
              }}
              style={{ marginTop: 10, borderRadius: 16 }}
            />

            <View style={{ marginTop: 16, gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: palette.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
                  Check-in: {startISO ?? "—"}
                </ThemedText>
                <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
                  Check-out: {endExclusive ?? "—"}
                </ThemedText>
              </View>
              <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                ⏱️ {daysCount} {daysCount === 1 ? "dia" : "dias"} {item.minRentalDays ? `(mín: ${minDays})` : ""}
              </ThemedText>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                <View>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    Diária
                  </ThemedText>
                  <ThemedText type="title-3" style={{ fontWeight: '600', color: palette.tint }}>
                    {item.isFree ? "Grátis" : `${item.dailyRate != null ? `R$ ${item.dailyRate.toFixed(2)}` : "—"}`}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    Total
                  </ThemedText>
                  <ThemedText type="title-2" style={{ fontWeight: '700', color: '#96ff9a' }}>
                    {total ? `R$ ${total.toFixed(2)}` : "—"}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Button
              variant="primary"
              onPress={() => {
                HapticFeedback.medium();
                requestReservation();
              }}
              disabled={!uid || !startISO || !endExclusive || daysCount < minDays}
              fullWidth
              style={{ marginTop: 16 }}
            >
              Solicitar reserva
            </Button>
          </LiquidGlassView>

          {/* FORM DE AVALIAÇÃO */}
          <LiquidGlassView
            intensity="standard"
            cornerRadius={20}
            style={{ padding: 20 }}
          >
            <ThemedText type="title-2" style={{ marginBottom: 16, fontWeight: '600' }}>
              Avaliar este item
            </ThemedText>

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

                  <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ marginTop: 12 }}>
                    <TextInput
                      placeholder="Escreva um comentário (opcional)"
                      placeholderTextColor={placeholderColor}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      style={[inputStyle, { backgroundColor: 'transparent', minHeight: 100, textAlignVertical: "top" }]}
                    />
                  </LiquidGlassView>

                  <Button
                    variant="primary"
                    onPress={() => {
                      HapticFeedback.medium();
                      submitReview();
                    }}
                    style={{ marginTop: 16, alignSelf: 'flex-start' }}
                  >
                    Enviar avaliação
                  </Button>
                </>
              ) : (
                <ThemedText type="callout" style={{ marginTop: 16 }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Você poderá avaliar depois de concluir a devolução de uma reserva deste item.
                </ThemedText>
              )
            ) : (
              <ThemedText type="callout" style={{ marginTop: 16 }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Faça login para avaliar este item.
              </ThemedText>
            )}
          </LiquidGlassView>

          {/* LISTA DE REVIEWS */}
          <View style={{ marginTop: 24 }}>
            <ThemedText type="title-2" style={{ marginBottom: 16, fontWeight: '600' }}>
              Comentários recentes
            </ThemedText>
            {reviews.length === 0 ? (
              <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ padding: 24, alignItems: 'center' }}>
                <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Ainda não há avaliações para este item.
                </ThemedText>
              </LiquidGlassView>
            ) : (
              reviews.map((r) => (
                <AnimatedCard key={r.id} style={{ marginBottom: 12 }}>
                  <LiquidGlassView intensity="standard" cornerRadius={16} style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Stars value={r.rating} />
                      <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('pt-BR') : ""}
                      </ThemedText>
                    </View>
                    {!!r.comment && (
                      <ThemedText type="body" style={{ marginTop: 4 }} className="text-light-text-secondary dark:text-dark-text-secondary">
                        {r.comment}
                      </ThemedText>
                    )}
                  </LiquidGlassView>
                </AnimatedCard>
              ))
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
