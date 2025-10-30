/**
 * useItemReviewSubmission - Hook for managing item review submission
 * 
 * Handles:
 * - Review form state (rating, comment, selected reservation)
 * - Review submission logic
 * - Eligible reservations loading
 */

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '@/lib/firebase';
import { logger } from '@/utils';
import { useReservationService, useReviewService } from '@/providers/ServicesProvider';

type UseItemReviewSubmissionResult = {
  // Form state
  selectedResId: string;
  rating: number;
  comment: string;
  eligibleRes: Array<{ id: string; label: string }>;
  
  // Form actions
  setSelectedResId: (id: string) => void;
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  
  // Submission
  submitReview: (itemId: string) => Promise<void>;
  loading: boolean;
};

export function useItemReviewSubmission(itemId: string): UseItemReviewSubmissionResult {
  const uid = auth.currentUser?.uid ?? null;
  const reservationService = useReservationService();
  const reviewService = useReviewService();

  const [selectedResId, setSelectedResId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [eligibleRes, setEligibleRes] = useState<Array<{ id: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Load eligible reservations
  useEffect(() => {
    (async () => {
      if (!uid) {
        setEligibleRes([]);
        return;
      }
      try {
        const list = await reservationService.listEligibleReservationsForReview(uid, itemId);
        setEligibleRes(list);
        if (list.length === 1) {
          setSelectedResId(list[0].id);
        }
      } catch (err) {
        logger.error("Error loading eligible reservations", err);
        setEligibleRes([]);
      }
    })();
  }, [uid, itemId, reservationService]);

  const submitReview = async (itemId: string) => {
    if (!uid) {
      Alert.alert("Sessão", "Faça login para avaliar.");
      return;
    }

    const validation = reviewService.validateReviewInput({
      renterUid: uid,
      reservationId: selectedResId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      itemId,
      type: 'item',
      comment,
    });

    if (!validation.valid) {
      Alert.alert("Avaliação", validation.error ?? "Dados inválidos.");
      return;
    }

    try {
      setLoading(true);
      await reviewService.createItemReview(itemId, {
        renterUid: uid,
        reservationId: selectedResId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        itemId,
        type: 'item',
        comment,
      });

      setComment("");
      setRating(5);
      Alert.alert("Obrigado!", "Sua avaliação foi registrada.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro ao enviar avaliação", error?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedResId,
    rating,
    comment,
    eligibleRes,
    setSelectedResId,
    setRating,
    setComment,
    submitReview,
    loading,
  };
}

