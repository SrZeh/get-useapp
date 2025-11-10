/**
 * Review-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Review rating value (1-5)
 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/**
 * Review type - defines what is being reviewed
 */
export type ReviewType = 'item' | 'owner' | 'renter';

export type ReviewParticipantRole = 'owner' | 'renter';

/**
 * Item review interface
 */
export interface Review {
  id: string;
  reservationId: string;
  renterUid: string;
  itemId: string;
  itemOwnerUid: string;
  type: Extract<ReviewType, 'item'>;
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
 * User review interface (owner ⇄ renter)
 */
export interface UserReview {
  id: string;
  reservationId: string;
  reviewerUid: string;
  reviewerRole: ReviewParticipantRole;
  targetUid: string;
  targetRole: ReviewParticipantRole;
  rating: ReviewRating;
  comment?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export type UserReviewDocument = FirestoreDocument<Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for creating a new item review
 */
export interface NewItemReviewInput {
  reservationId: string;
  renterUid: string;
  itemId: string;
  itemOwnerUid: string;
  rating: ReviewRating;
  comment?: string;
}

/**
 * Input type for creating a new user review
 */
export interface NewUserReviewInput {
  reservationId: string;
  reviewerUid: string;
  reviewerRole: ReviewParticipantRole;
  targetUid: string;
  targetRole: ReviewParticipantRole;
  rating: ReviewRating;
  comment?: string;
}

/**
 * Type guard to check if an object is a valid Review (item review)
 */
export function isReview(obj: unknown): obj is Review {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'rating' in obj &&
    'reservationId' in obj &&
    'renterUid' in obj &&
    'itemId' in obj &&
    'itemOwnerUid' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { rating: unknown }).rating === 'number' &&
    ((obj as { rating: number }).rating >= 1 && (obj as { rating: number }).rating <= 5)
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
  itemOwnerUid: string;
  renterUid: string;
}

