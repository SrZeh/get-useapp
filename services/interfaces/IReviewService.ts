/**
 * Review Service Interface
 * 
 * Defines the contract for review-related operations.
 * Allows for easy swapping of implementations and mocking in tests.
 */

import type {
  Review,
  UserReview,
  NewItemReviewInput,
  NewUserReviewInput,
} from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

/**
 * Review validation result
 */
export type ReviewValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Review Service Interface
 */
export interface IReviewService {
  /**
   * Create a new review for an item
   * @param itemId - Item ID
   * @param input - Review input data
   * @returns Created review ID
   */
  createItemReview(itemId: string, input: NewItemReviewInput): Promise<string>;

  /**
   * List reviews for an item
   * @param itemId - Item ID
   * @param limitCount - Maximum number of reviews to return
   * @returns Array of reviews
   */
  listItemReviews(itemId: string, limitCount?: number): Promise<Review[]>;

  /**
   * Subscribe to item reviews with real-time updates
   * @param itemId - Item ID
   * @param callback - Callback function for updates
   * @param limitCount - Maximum number of reviews to return
   * @returns Unsubscribe function
   */
  subscribeToItemReviews(
    itemId: string,
    callback: (reviews: Review[]) => void,
    limitCount?: number
  ): Unsubscribe;

  /**
   * Create a new review for a user (owner ⇄ renter)
   * @param input - Review input data
   * @returns Created review ID (reservationId)
   */
  createUserReview(input: NewUserReviewInput): Promise<string>;

  /**
   * List reviews received by a user
   * @param targetUid - User ID
   * @param limitCount - Maximum number of reviews to return
   */
  listUserReviews(targetUid: string, limitCount?: number): Promise<UserReview[]>;

  /**
   * Subscribe to user reviews with real-time updates
   * @param targetUid - User ID
   * @param callback - Callback function for updates
   * @param limitCount - Maximum number of reviews to return
   */
  subscribeToUserReviews(
    targetUid: string,
    callback: (reviews: UserReview[]) => void,
    limitCount?: number
  ): Unsubscribe;

  /**
   * Validate item review input before submission
   * @param input - Review input data
   * @returns Validation result with error message if invalid
   */
  validateItemReviewInput(input: Partial<NewItemReviewInput>): ReviewValidationResult;

  /**
   * Validate user review input before submission
   * @param input - Review input data
   * @returns Validation result with error message if invalid
   */
  validateUserReviewInput(input: Partial<NewUserReviewInput>): ReviewValidationResult;
}

