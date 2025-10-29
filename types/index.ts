/**
 * Centralized type definitions barrel file
 * 
 * This file exports all type definitions from the types directory
 * for convenient importing throughout the application.
 */

// Firestore utilities
export type {
  FirestoreTimestamp,
  FirestoreDocument,
} from './firestore';

export {
  isTimestamp,
  toDate,
} from './firestore';

// Item types
export type {
  Item,
  ItemDocument,
  ItemCategory,
  ItemCondition,
  NewItemInput,
} from './item';

export { isItem } from './item';

// Reservation types
export type {
  Reservation,
  ReservationDocument,
  ReservationStatus,
  PaymentMethodType,
  NewReservationInput,
} from './reservation';

export {
  isReservation,
  isRefundable,
} from './reservation';

// Transaction types
export type {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  NewTransactionInput,
} from './transaction';

export {
  isTransaction,
  isValidStatusTransition,
} from './transaction';

// User types
export type {
  UserProfile,
  UserDocument,
  UserProfileInput,
  AuthenticatedUser,
} from './user';

export { isUserProfile } from './user';

// Review types
export type {
  Review,
  ReviewDocument,
  ReviewType,
  ReviewRating,
  NewReviewInput,
} from './review';

export {
  isReview,
  isValidRating,
} from './review';

// Error types
export type {
  AppError,
  NetworkError,
  ValidationError,
  AuthError,
  FirestoreError,
} from './errors';

export {
  AppError,
  NetworkError,
  ValidationError,
  AuthError,
  FirestoreError,
  isAppError,
  toAppError,
} from './errors';

