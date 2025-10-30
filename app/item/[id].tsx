/**
 * Item Detail Screen - Display item details, booking calendar, and reviews
 * 
 * Refactored to use extracted hooks:
 * - useItemDetail: Item fetching and loading
 * - useItemBookingCalendar: Booked days, date range, calculations
 * - useItemReviewSubmission: Review form state and submission
 * - useItemReservation: Reservation request logic
 */

import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import type { Review } from "@/types";
import { CalendarSection } from "@/components/reservation";
import { ReviewSection, ReviewList } from "@/components/review";
import { ItemHeader } from "@/components/features/items";
import { LoadingState } from "@/components/states";
import { useReviewService } from "@/providers/ServicesProvider";
import { Spacing } from "@/constants/spacing";
import { SeoHead } from "@/utils/seo";
import { buildItemDetailPtBR } from "@/constants/seo/examples/itemDetail.pt-BR";
import {
  useItemDetail,
  useItemBookingCalendar,
  useItemReviewSubmission,
  useItemReservation,
} from "@/hooks/features/items";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const uid = auth.currentUser?.uid ?? null;
  const reviewService = useReviewService();

  // Item detail hook
  const { item, loading: itemLoading } = useItemDetail(id);

  // Booking calendar hook
  const bookingCalendar = useItemBookingCalendar(id, item);

  // Review submission hook
  const reviewSubmission = useItemReviewSubmission(id);

  // Reservation hook
  const reservation = useItemReservation({
    item,
    startISO: bookingCalendar.startISO,
    endISOInc: bookingCalendar.endISOInc,
    endExclusive: bookingCalendar.endExclusive,
    daysCount: bookingCalendar.daysCount,
    minDays: bookingCalendar.minDays,
    total: bookingCalendar.total,
    booked: bookingCalendar.booked,
  });

  // Reviews subscription
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const unsub = reviewService.subscribeToItemReviews(id, (reviewList) => {
      setReviews(reviewList);
    });
    return () => unsub();
  }, [id, reviewService]);

  if (itemLoading || !item) {
    return <LoadingState message="Carregando item…" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <SeoHead
        meta={buildItemDetailPtBR({
          itemName: item.title ?? 'Item para aluguel',
          city: item.city ?? 'Florianópolis',
          dailyRate: item.dailyRate,
          category: item.category,
          path: `/item/${id}`,
          image: item.photos?.[0] ?? undefined,
        })}
      />
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
            booked={bookingCalendar.booked}
            startISO={bookingCalendar.startISO}
            endISOInc={bookingCalendar.endISOInc}
            onDateRangeChange={bookingCalendar.handleDateRangeChange}
            onRequestReservation={reservation.requestReservation}
            disabled={!uid}
          />

          {/* FORM DE AVALIAÇÃO */}
          <ReviewSection
            userId={uid}
            eligibleReservations={reviewSubmission.eligibleRes}
            selectedReservationId={reviewSubmission.selectedResId}
            onReservationSelect={reviewSubmission.setSelectedResId}
            rating={reviewSubmission.rating}
            onRatingChange={reviewSubmission.setRating}
            comment={reviewSubmission.comment}
            onCommentChange={reviewSubmission.setComment}
            onSubmit={() => reviewSubmission.submitReview(id)}
            submitting={reviewSubmission.loading}
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
