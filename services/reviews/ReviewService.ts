/**
 * Review Service
 * 
 * Provides CRUD operations for item reviews.
 * Handles review creation, fetching, and rating aggregation.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Review, NewReviewInput } from '@/types';
import { logger } from '@/utils';
import { isValidRating } from '@/types/review';

/**
 * Create a new review for an item
 * @param itemId - Item ID
 * @param input - Review input data
 * @returns Created review ID
 */
export async function createItemReview(itemId: string, input: NewReviewInput): Promise<string> {
  if (!isValidRating(input.rating)) {
    throw new Error('Rating deve ser entre 1 e 5');
  }

  if (!input.itemOwnerUid) {
    throw new Error('Dono do item é obrigatório');
  }

  if (!input.reservationId) {
    throw new Error('Reserva deve ser informada');
  }

  const reservationReviewRef = doc(db, 'items', itemId, 'reviews', input.reservationId);
  const existingReview = await getDoc(reservationReviewRef);
  if (existingReview.exists()) {
    throw new Error('Você já avaliou esta reserva.');
  }

  const trimmedComment = input.comment?.trim();

  // Create review document
  const reviewData = {
    renterUid: input.renterUid,
    reservationId: input.reservationId,
    itemId: input.itemId ?? itemId,
    itemOwnerUid: input.itemOwnerUid,
    type: 'item' as const,
    rating: input.rating,
    comment: trimmedComment ?? '',
    createdAt: serverTimestamp(),
  };

  await setDoc(reservationReviewRef, reviewData, { merge: false });

  try {
    await updateDoc(doc(db, 'reservations', input.reservationId), {
      'reviewsOpen.renterCanReviewItem': false,
      'reviewsOpen.renterCanReviewOwner': false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (typeof logger.warn === 'function') {
      logger.warn('Não foi possível atualizar reviewsOpen da reserva após avaliação', error);
    } else {
      console.warn('Não foi possível atualizar reviewsOpen da reserva após avaliação', error);
    }
  }

  return reservationReviewRef.id;
}

/**
 * List reviews for an item
 * @param itemId - Item ID
 * @param limitCount - Maximum number of reviews to return
 * @returns Array of reviews
 */
export async function listItemReviews(itemId: string, limitCount: number = 20): Promise<Review[]> {
  const q = query(
    collection(db, 'items', itemId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Partial<Review>) } as Review)
  );
}

/**
 * Subscribe to item reviews with real-time updates
 * @param itemId - Item ID
 * @param callback - Callback function for updates
 * @param limitCount - Maximum number of reviews to return
 * @returns Unsubscribe function
 */
export function subscribeToItemReviews(
  itemId: string,
  callback: (reviews: Review[]) => void,
  limitCount: number = 20
): Unsubscribe {
  const q = query(
    collection(db, 'items', itemId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const reviews = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Partial<Review>) } as Review)
      );
      callback(reviews);
    },
    (err) => logger.error('Item reviews snapshot listener error', err, { code: err?.code, message: err?.message })
  );
}

/**
 * Validate review input before submission
 * @param input - Review input data
 * @returns Validation result with error message if invalid
 */
export function validateReviewInput(input: Partial<NewReviewInput>): {
  valid: boolean;
  error?: string;
} {
  if (!input.rating || !isValidRating(input.rating)) {
    return { valid: false, error: 'Rating deve ser de 1 a 5.' };
  }

  if (!input.reservationId) {
    return { valid: false, error: 'Reserva deve ser selecionada.' };
  }

  if (!input.renterUid) {
    return { valid: false, error: 'Usuário deve estar autenticado.' };
  }

  if (!input.itemOwnerUid) {
    return { valid: false, error: 'Não foi possível identificar o dono do item.' };
  }

  return { valid: true };
}

