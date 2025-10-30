/**
 * Review-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Review rating value (1-5)
 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/**
 * Review type - can be for item or owner
 */
export type ReviewType = 'item' | 'owner';

/**
 * Base Review interface
 */
export interface Review {
  id: string;
  reservationId: string;
  renterUid: string;
  itemId?: string;
  ownerUid?: string;
  type: ReviewType;
  rating: ReviewRating;
  comment?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

/**
 * Review document as stored in Firestore
 */
export type ReviewDocument = FirestoreDocument<Omit<Review, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for creating a new review
 */
export interface NewReviewInput {
  reservationId: string;
  renterUid: string;
  itemId?: string;
  ownerUid?: string;
  type: ReviewType;
  rating: ReviewRating;
  comment?: string;
}

/**
 * Type guard to check if an object is a valid Review
 */
export function isReview(obj: unknown): obj is Review {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'rating' in obj &&
    'type' in obj &&
    'reservationId' in obj &&
    'renterUid' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { rating: unknown }).rating === 'number' &&
    ((obj as { rating: number }).rating >= 1 && (obj as { rating: number }).rating <= 5) &&
    typeof (obj as { type: unknown }).type === 'string'
  );
}

/**
 * Validate rating value
 */
export function isValidRating(rating: unknown): rating is ReviewRating {
  return typeof rating === 'number' && rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Eligible reservation for review purposes
 * Used in review forms to display available reservations for review
 */
export interface EligibleReservation {
  id: string;
  label: string;
}

