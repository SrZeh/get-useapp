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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import type { Review, UserReview } from "@/types";
import { CalendarSection } from "@/components/reservation";
import { ReviewSection, ReviewList, UserReviewList, StarRating } from "@/components/review";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { ItemHeader, OwnerInfo } from "@/components/features/items";
import { LoadingState } from "@/components/states";
import { useReviewService } from "@/providers/ServicesProvider";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { LiquidGlassView } from "@/components/liquid-glass";
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
  const insets = useSafeAreaInsets();

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

  // Reviews subscription (item reviews)
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const unsub = reviewService.subscribeToItemReviews(id, (reviewList) => {
      setReviews(reviewList);
    });
    return () => unsub();
  }, [id, reviewService]);

  // Owner reviews subscription and profile
  const [ownerReviews, setOwnerReviews] = useState<UserReview[]>([]);
  const [ownerRating, setOwnerRating] = useState<number | null>(null);
  const getProfile = useUserProfileStore((state) => state.getProfile);
  
  useEffect(() => {
    if (!item?.ownerUid) {
      setOwnerReviews([]);
      setOwnerRating(null);
      return;
    }

    const unsub = reviewService.subscribeToUserReviews(item.ownerUid, (reviewList) => {
      setOwnerReviews(reviewList);
    });
    
    // Load owner rating
    (async () => {
      try {
        const profile = await getProfile(item.ownerUid, false);
        if (profile) {
          setOwnerRating(profile.ratingAvg ?? 0);
        }
      } catch (error) {
        console.error('Error loading owner rating:', error);
      }
    })();
    
    return () => unsub();
  }, [item?.ownerUid, reviewService, getProfile]);

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
          contentContainerStyle={{ 
            padding: Spacing.sm, 
            paddingBottom: Spacing['3xl'],
            paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER DO ITEM */}
          <ItemHeader item={item} />

          {/* INFORMAÇÕES DO DONO */}
          {item.ownerUid && (
            <OwnerInfo ownerUid={item.ownerUid} />
          )}

          {/* CALENDÁRIO / RESERVA */}
          <CalendarSection
            item={item}
            booked={bookingCalendar.booked}
            startISO={bookingCalendar.startISO}
            endISOInc={bookingCalendar.endISOInc}
            onDateRangeChange={bookingCalendar.handleDateRangeChange}
            onRequestReservation={reservation.requestReservation}
            disabled={!uid}
            submitting={reservation.submitting}
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
            isAlreadyReviewed={reviewSubmission.isSelectedReservationReviewed}
          />

          {/* LISTA DE REVIEWS DO ITEM */}
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

          {/* AVALIAÇÕES DO USUÁRIO (DONO) */}
          {item.ownerUid && (ownerReviews.length > 0 || ownerRating !== null) && (
            <View style={{ marginTop: Spacing.lg }}>
              <View style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <ThemedText 
                  type="title-2" 
                  style={{ 
                    fontWeight: '700',
                  }}
                  lightColor={Colors.light.text}
                  darkColor={Colors.dark.text}
                >
                  Avaliações do usuário
                </ThemedText>
                {ownerRating !== null && ownerRating > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2xs'] }}>
                    <StarRating value={ownerRating} size={16} />
                    <ThemedText 
                      type="callout" 
                      className="text-light-text-secondary dark:text-dark-text-secondary"
                    >
                      {ownerRating.toFixed(1)}
                    </ThemedText>
                  </View>
                )}
              </View>
              {ownerReviews.length > 0 ? (
                <UserReviewList reviews={ownerReviews} />
              ) : (
                <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
                  <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    Ainda não há avaliações para este usuário.
                  </ThemedText>
                </LiquidGlassView>
              )}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
