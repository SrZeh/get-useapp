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
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/utils';
import { useReservationService, useReviewService } from '@/providers/ServicesProvider';

type EligibleReservationInfo = {
  id: string;
  label: string;
  itemOwnerUid: string;
  renterUid: string;
};

type UseItemReviewSubmissionResult = {
  // Form state
  selectedResId: string;
  rating: number;
  comment: string;
  eligibleRes: EligibleReservationInfo[];
  // Selected reservation metadata
  selectedOwnerUid?: string;
  
  // Form actions
  setSelectedResId: (id: string) => void;
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  
  // Submission
  submitReview: (itemId: string) => Promise<void>;
  loading: boolean;
  
  // Review status
  reviewedReservations: Set<string>;
  isSelectedReservationReviewed: boolean;
};

export function useItemReviewSubmission(itemId: string): UseItemReviewSubmissionResult {
  const uid = auth.currentUser?.uid ?? null;
  const reservationService = useReservationService();
  const reviewService = useReviewService();

  const [selectedResId, setSelectedResId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [eligibleRes, setEligibleRes] = useState<EligibleReservationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewedReservations, setReviewedReservations] = useState<Set<string>>(new Set());

  // Load eligible reservations and check which ones are already reviewed
  useEffect(() => {
    (async () => {
      if (!uid) {
        setEligibleRes([]);
        setReviewedReservations(new Set());
        return;
      }
      try {
        const list = await reservationService.listEligibleReservationsForReview(uid, itemId);
        const filtered = list.filter((entry) => !!entry.itemOwnerUid);
        setEligibleRes(filtered);
        
        // Check which reservations already have reviews
        const reviewed = new Set<string>();
        for (const res of filtered) {
          try {
            const reviewRef = doc(db, 'items', itemId, 'reviews', res.id);
            const reviewSnap = await getDoc(reviewRef);
            if (reviewSnap.exists()) {
              reviewed.add(res.id);
            }
          } catch (err) {
            // Ignore errors checking individual reviews
          }
        }
        setReviewedReservations(reviewed);
        
        // Auto-select the first non-reviewed reservation, or the only one if there's just one
        const notReviewed = filtered.filter((r) => !reviewed.has(r.id));
        if (notReviewed.length === 1) {
          setSelectedResId(notReviewed[0].id);
        } else if (filtered.length === 1 && reviewed.has(filtered[0].id)) {
          // Only one reservation and it's already reviewed - still select it to show message
          setSelectedResId(filtered[0].id);
        } else if (notReviewed.length > 0) {
          // Select the first non-reviewed (most recent)
          setSelectedResId(notReviewed[0].id);
        } else if (filtered.length > 0) {
          // All reviewed, select the first one to show message
          setSelectedResId(filtered[0].id);
        }
      } catch (err) {
        logger.error("Error loading eligible reservations", err);
        setEligibleRes([]);
        setReviewedReservations(new Set());
      }
    })();
  }, [uid, itemId, reservationService]);

  const submitReview = async (itemId: string) => {
    if (!uid) {
      Alert.alert("Sessão", "Faça login para avaliar.");
      return;
    }

    const selectedReservation = eligibleRes.find((entry) => entry.id === selectedResId);
    if (!selectedReservation) {
      Alert.alert("Avaliação", "Selecione a reserva utilizada para avaliar.");
      return;
    }

    const trimmedComment = comment.trim();

    const validation = reviewService.validateItemReviewInput({
      renterUid: uid,
      reservationId: selectedResId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      itemId,
      comment: trimmedComment,
      itemOwnerUid: selectedReservation.itemOwnerUid,
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
        comment: trimmedComment,
        itemOwnerUid: selectedReservation.itemOwnerUid,
      });

      // Mark this reservation as reviewed
      setReviewedReservations((prev) => new Set(prev).add(selectedResId));
      
      setComment("");
      setRating(5);
      Alert.alert("Obrigado!", "Sua avaliação foi registrada.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      const message = error?.message ?? String(e);
      if (message.toLowerCase().includes('já avaliou')) {
        // Mark as reviewed if error says already reviewed
        setReviewedReservations((prev) => new Set(prev).add(selectedResId));
      }
      Alert.alert("Erro ao enviar avaliação", message);
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
    selectedOwnerUid: eligibleRes.find((entry) => entry.id === selectedResId)?.itemOwnerUid,
    submitReview,
    loading,
    reviewedReservations,
    isSelectedReservationReviewed: reviewedReservations.has(selectedResId),
  };
}

