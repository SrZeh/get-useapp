import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { AnimatedCard } from '@/components/AnimatedCard';
import { StarRating } from './StarRating';
import type { UserReview } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type UserReviewListProps = {
  reviews: UserReview[];
};

/**
 * UserReviewList component - displays a list of user reviews
 * 
 * Features:
 * - Review cards with ratings and comments
 * - Empty state when no reviews
 * - Date formatting
 * - Shows reviewer role (owner/renter)
 */
export function UserReviewList({ reviews }: UserReviewListProps) {
  if (reviews.length === 0) {
    return (
      <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
        <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
          Ainda não há avaliações para este usuário.
        </ThemedText>
      </LiquidGlassView>
    );
  }

  return (
    <>
      {reviews.map((r) => {
        // Determine role label
        const roleLabel = r.reviewerRole === 'owner' ? 'Dono do item' : 'Locatário';
        
        return (
          <AnimatedCard key={r.id} style={{ marginBottom: Spacing.xs }}>
            <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.md} style={{ padding: Spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2xs'], marginBottom: Spacing['2xs'] }}>
                <StarRating value={r.rating} />
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('pt-BR') : ''}
                </ThemedText>
              </View>
              <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ marginBottom: Spacing['3xs'] }}>
                Avaliado por: {roleLabel}
              </ThemedText>
              {!!r.comment && (
                <ThemedText type="body" style={{ marginTop: Spacing['3xs'] }} className="text-light-text-secondary dark:text-dark-text-secondary">
                  {r.comment}
                </ThemedText>
              )}
            </LiquidGlassView>
          </AnimatedCard>
        );
      })}
    </>
  );
}


