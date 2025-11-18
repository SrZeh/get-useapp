/**
 * Firebase Review Service Implementation
 * 
 * Concrete implementation of IReviewService using Firebase Firestore.
 * This is the default implementation used in production.
 */

import type { IReviewService } from '../interfaces';
import * as ReviewService from '../reviews/ReviewService';

/**
 * Firebase implementation of Review Service
 */
export class FirebaseReviewService implements IReviewService {
  createItemReview = ReviewService.createItemReview;
  listItemReviews = ReviewService.listItemReviews;
  subscribeToItemReviews = ReviewService.subscribeToItemReviews;
  createUserReview = ReviewService.createUserReview;
  listUserReviews = ReviewService.listUserReviews;
  subscribeToUserReviews = ReviewService.subscribeToUserReviews;
  validateItemReviewInput = ReviewService.validateItemReviewInput;
  validateUserReviewInput = ReviewService.validateUserReviewInput;
}

// Export singleton instance
export const firebaseReviewService = new FirebaseReviewService();

