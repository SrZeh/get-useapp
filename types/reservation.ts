/**
 * Reservation-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Reservation status types
 */
export type ReservationStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'picked_up'
  | 'paid_out'
  | 'returned'
  | 'canceled'
  | 'closed';

/**
 * Payment method types
 */
export type PaymentMethodType = 'pix' | 'boleto' | 'card' | string | null;

/**
 * Base Reservation interface
 */
export interface Reservation {
  id: string;
  itemId: string;
  itemTitle?: string;
  renterUid: string;
  itemOwnerUid: string;
  
  // Date range (startDate is inclusive, endDate is exclusive)
  startDate?: string; // ISO date string (inclusive)
  endDate?: string;   // ISO date string (exclusive)
  days?: number;
  
  // Financial
  total?: number | string;
  isFree?: boolean;
  
  // Status and workflow
  status: ReservationStatus;
  paymentMethodType?: PaymentMethodType;
  
  // Reviews configuration
  reviewsOpen?: {
    renterCanReviewOwner?: boolean;
    renterCanReviewItem?: boolean;
    ownerCanReviewRenter?: boolean;
  };
  
  // Timestamps
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
  paidAt?: FirestoreTimestamp;
  acceptedAt?: FirestoreTimestamp;
  rejectedAt?: FirestoreTimestamp;
  pickedUpAt?: FirestoreTimestamp;
  returnedAt?: FirestoreTimestamp;
  
  // Who performed actions
  acceptedBy?: string;
  rejectedBy?: string;
}

/**
 * Reservation document as stored in Firestore
 */
export type ReservationDocument = FirestoreDocument<Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for creating a new reservation
 */
export interface NewReservationInput {
  itemId: string;
  itemTitle: string;
  itemOwnerUid: string;
  renterUid: string;
  startDate: string; // ISO date string (inclusive)
  endDate: string;    // ISO date string (exclusive)
  days: number;
  total: number;
  isFree: boolean;
}

/**
 * Type guard to check if an object is a valid Reservation
 */
export function isReservation(obj: unknown): obj is Reservation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'status' in obj &&
    'itemId' in obj &&
    'renterUid' in obj &&
    'itemOwnerUid' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { status: unknown }).status === 'string'
  );
}

/**
 * Check if a reservation status allows refund
 */
export function isRefundable(reservation: Reservation): boolean {
  if (reservation.status !== 'paid') return false;
  if (reservation.pickedUpAt) return false; // Already marked as received
  
  // Can only refund within 7 days of payment
  const paidAt = reservation.paidAt;
  if (!paidAt) return false;
  
  // Date conversion logic would go here
  // This is a placeholder - actual implementation should use toDate from firestore.ts
  return true;
}

