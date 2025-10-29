/**
 * Review Service
 * 
 * Provides CRUD operations for item reviews.
 * Handles review creation, fetching, and rating aggregation.
 */

import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Review, NewReviewInput, ReviewRating } from '@/types';
import { logger } from '@/utils';
import { isValidRating } from '@/types/review';
import { safeBumpRating } from '@/services/items';

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

  // Create review document
  const reviewData = {
    renterUid: input.renterUid,
    reservationId: input.reservationId,
    itemId: input.itemId ?? itemId,
    ownerUid: input.ownerUid,
    type: 'item' as const,
    rating: input.rating,
    comment: input.comment?.trim() ?? '',
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'items', itemId, 'reviews'), reviewData);

  // Update item rating aggregates using the item service
  const lastSnippet = input.comment?.trim() ? input.comment.trim().slice(0, 120) : undefined;
  await safeBumpRating(itemId, input.rating, lastSnippet);

  return ref.id;
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

  return { valid: true };
}

