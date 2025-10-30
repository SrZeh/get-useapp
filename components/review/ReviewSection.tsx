import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReviewForm } from './ReviewForm';
import type { Review, EligibleReservation } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type ReviewSectionProps = {
  userId: string | null;
  eligibleReservations: EligibleReservation[];
  selectedReservationId: string;
  onReservationSelect: (id: string) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

/**
 * ReviewSection component - container for review form
 * 
 * Features:
 * - Login check
 * - Review form with reservation selection
 * - Submit handler
 */
export function ReviewSection({
  userId,
  eligibleReservations,
  selectedReservationId,
  onReservationSelect,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onSubmit,
  submitting = false,
}: ReviewSectionProps) {
  if (!userId) {
    return (
      <ThemedText type="callout" style={{ marginTop: Spacing.sm }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
        Faça login para avaliar este item.
      </ThemedText>
    );
  }

  return (
    <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ padding: 20 }}>
      <ThemedText type="title-2" style={{ marginBottom: Spacing.sm, fontWeight: '600' }}>
        Avaliar este item
      </ThemedText>
      <ReviewForm
        eligibleReservations={eligibleReservations}
        selectedReservationId={selectedReservationId}
        onReservationSelect={onReservationSelect}
        rating={rating}
        onRatingChange={onRatingChange}
        comment={comment}
        onCommentChange={onCommentChange}
        onSubmit={onSubmit}
        disabled={submitting}
      />
    </LiquidGlassView>
  );
}

