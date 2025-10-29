// app/item/[id].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import type { Item, Review } from "@/types";
import { logger, nextDay, diffDaysExclusive, enumerateInclusive } from "@/utils";
import { CalendarSection } from "@/components/reservation";
import { ReviewSection, ReviewList } from "@/components/review";
import { ItemHeader } from "@/components/features/items";
import { LoadingState } from "@/components/states";
import { useReservationService, useReviewService } from "@/providers/ServicesProvider";
import { Spacing } from "@/constants/spacing";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const uid = auth.currentUser?.uid ?? null;
  const reservationService = useReservationService();
  const reviewService = useReviewService();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [busyChat, setBusyChat] = useState(false);                // ⬅️ ADD

  // --- calendar state ---
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [startISO, setStartISO] = useState<string | null>(null);
  const [endISOInc, setEndISOInc] = useState<string | null>(null);

  // --- reviews ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleRes, setEligibleRes] = useState<{ id: string; label: string }[]>([]);
  const [selectedResId, setSelectedResId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");






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

  // Date range change handler for CalendarSection
  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setStartISO(start);
    setEndISOInc(end);
  };

  // Reviews em tempo real
  useEffect(() => {
    const unsub = reviewService.subscribeToItemReviews(id, (reviewList) => {
      setReviews(reviewList);
    });
    return () => unsub();
  }, [id, reviewService]);

  // Reservas elegíveis do usuário p/ avaliar
  useEffect(() => {
    (async () => {
      if (!uid) return;
      try {
        const list = await reservationService.listEligibleReservationsForReview(uid, id);
        setEligibleRes(list);
        if (list.length === 1) setSelectedResId(list[0].id);
      } catch (err) {
        logger.error("Error loading eligible reservations", err);
      }
    })();
  }, [uid, id, reservationService]);

  // cálculo resumo reserva (for requestReservation function)
  const endExclusive = endISOInc ? nextDay(endISOInc) : null;
  const daysCount = startISO && endExclusive ? diffDaysExclusive(startISO, endExclusive) : 0;
  const minDays = item?.minRentalDays ?? 1;
  const rate = item?.isFree ? 0 : (item?.dailyRate ?? 0);
  const total = daysCount > 0 ? rate * daysCount : 0;


  async function submitReview() {
    if (!uid) {
      Alert.alert("Sessão", "Faça login para avaliar.");
      return;
    }

    const validation = reviewService.validateReviewInput({
      renterUid: uid,
      reservationId: selectedResId,
      rating: rating as any,
      itemId: id,
      type: 'item',
      comment,
    });

    if (!validation.valid) {
      Alert.alert("Avaliação", validation.error ?? "Dados inválidos.");
      return;
    }

    try {
      await reviewService.createItemReview(id, {
        renterUid: uid,
        reservationId: selectedResId,
        rating: rating as any,
        itemId: id,
        type: 'item',
        comment,
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

      await reservationService.createReservation({
        itemId: item.id,
        itemTitle: item.title ?? "",
        itemOwnerUid: item.ownerUid ?? "",
        renterUid: u.uid,                  // use o UID fresco
        startDate: startISO,               // inclusivo
        endDate: endExclusive,             // exclusivo (check-out)
        days: daysCount,
        total: total,
        isFree: !!item.isFree,
      });

      Alert.alert("Pedido enviado!", "Aguarde o dono aceitar para efetuar o pagamento.");
      router.back();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro", error?.message ?? String(e));
    }
  }

  



  if (loading || !item) {
    return <LoadingState message="Carregando item…" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView 
          contentContainerStyle={{ padding: Spacing.sm, paddingBottom: Spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER DO ITEM */}
          <ItemHeader item={item} />

          {/* CALENDÁRIO / RESERVA */}
          <CalendarSection
            item={item}
            booked={booked}
            startISO={startISO}
            endISOInc={endISOInc}
            onDateRangeChange={handleDateRangeChange}
            onRequestReservation={requestReservation}
            disabled={!uid}
          />

          {/* FORM DE AVALIAÇÃO */}
          <ReviewSection
            userId={uid}
            eligibleReservations={eligibleRes}
            selectedReservationId={selectedResId}
            onReservationSelect={setSelectedResId}
            rating={rating}
            onRatingChange={setRating}
            comment={comment}
            onCommentChange={setComment}
            onSubmit={submitReview}
          />

          {/* LISTA DE REVIEWS */}
          {reviews.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <ThemedText 
                type="title-2" 
                style={{ 
                  marginBottom: 20, // Spacing scale gap - could use md (24) but 20 is close to lg boundary
                  fontWeight: '700',
                }}
                lightColor={Colors.light.text}
                darkColor={Colors.dark.text}
              >
                Comentários recentes
              </ThemedText>
              <ReviewList reviews={reviews} />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
