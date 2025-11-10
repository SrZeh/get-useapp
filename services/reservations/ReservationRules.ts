/**
 * Reservation business rules and validation logic
 * 
 * Centralized business rules for reservation actions and state transitions.
 * These rules define what actions can be performed on reservations based on
 * their current status and the user's role (owner vs renter).
 */

import type { Reservation } from '@/types';
import { toDate } from '@/types';

// Refund window: 7 days in milliseconds
const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if a reservation is eligible for refund
 * 
 * Rules:
 * - Status must be 'paid'
 * - Item must not have been picked up yet
 * - Payment must have been made within 7 days
 * 
 * @param reservation - Reservation to check
 * @returns true if refund is eligible
 */
export function isRefundable(reservation: Reservation): boolean {
  if (reservation.status !== 'paid') {
    return false;
  }

  // Cannot refund if item was already picked up
  if (reservation.pickedUpAt) {
    return false;
  }

  // Check if payment was made within refund window
  const paidAt = toDate(reservation.paidAt);
  if (!paidAt || isNaN(paidAt.getTime())) {
    return false;
  }

  const timeSincePayment = Date.now() - paidAt.getTime();
  return timeSincePayment <= REFUND_WINDOW_MS;
}

/**
 * Check if renter can cancel a reservation
 * 
 * Rules:
 * - Status must be 'requested', 'rejected', or 'canceled'
 * 
 * @param reservation - Reservation to check
 * @returns true if cancellation is allowed
 */
export function canCancel(reservation: Reservation): boolean {
  return ['requested', 'rejected', 'canceled'].includes(reservation.status);
}

/**
 * Check if renter can mark item as received (picked up)
 * 
 * Rules:
 * - Status must be 'paid'
 * - Item must not have been picked up yet
 * 
 * @param reservation - Reservation to check
 * @returns true if pickup can be marked
 */
export function canMarkPickup(reservation: Reservation): boolean {
  return reservation.status === 'paid' && !reservation.pickedUpAt;
}

/**
 * Check if owner can confirm return
 * 
 * Rules:
 * - Status must be 'picked_up' or 'paid_out'
 * 
 * @param reservation - Reservation to check
 * @returns true if return can be confirmed
 */
export function canConfirmReturn(reservation: Reservation): boolean {
  return ['picked_up', 'paid_out'].includes(reservation.status);
}

/**
 * Check if owner can accept a reservation
 * 
 * Rules:
 * - Status must be 'requested'
 * 
 * @param reservation - Reservation to check
 * @returns true if reservation can be accepted
 */
export function canAccept(reservation: Reservation): boolean {
  return reservation.status === 'requested';
}

/**
 * Check if owner can reject a reservation
 * 
 * Rules:
 * - Status must be 'requested'
 * 
 * @param reservation - Reservation to check
 * @returns true if reservation can be rejected
 */
export function canReject(reservation: Reservation): boolean {
  return reservation.status === 'requested';
}

/**
 * Check if owner can delete a reservation
 * 
 * Rules:
 * - Status must be 'requested'
 * 
 * @param reservation - Reservation to check
 * @returns true if reservation can be deleted by owner
 */
export function canDeleteByOwner(reservation: Reservation): boolean {
  return reservation.status === 'requested';
}

/**
 * Check if renter can delete a reservation
 * 
 * Rules:
 * - Status must be 'requested', 'rejected', or 'canceled'
 * 
 * @param reservation - Reservation to check
 * @returns true if reservation can be deleted by renter
 */
export function canDeleteByRenter(reservation: Reservation): boolean {
  return ['requested', 'rejected', 'canceled'].includes(reservation.status);
}

/**
 * Check if renter can pay for a reservation
 * 
 * Rules:
 * - Status must be 'accepted'
 * - Payment must not have been made yet
 * 
 * @param reservation - Reservation to check
 * @returns true if payment can be made
 */
export function canPay(reservation: Reservation): boolean {
  return reservation.status === 'accepted' && !reservation.paidAt;
}

/**
 * Check if renter can review after reservation
 * 
 * Rules:
 * - Status must be 'returned'
 * - Reviews must be open for renter
 * 
 * @param reservation - Reservation to check
 * @returns true if review can be submitted
 */
export function canReview(reservation: Reservation): boolean {
  if (reservation.status !== 'returned') return false;
  const reviews = reservation.reviewsOpen ?? {};
  const canReviewOwner = reviews.renterCanReviewOwner ?? true;
  const canReviewItem = reviews.renterCanReviewItem ?? true;
  return canReviewOwner || canReviewItem;
}

/**
 * Get allowed actions for owner based on reservation status
 * 
 * @param reservation - Reservation to check
 * @returns Array of allowed action types
 */
export function getOwnerAllowedActions(reservation: Reservation): string[] {
  const actions: string[] = [];

  if (canAccept(reservation)) actions.push('accept');
  if (canReject(reservation)) actions.push('reject');
  if (canDeleteByOwner(reservation)) actions.push('delete');
  if (canConfirmReturn(reservation)) actions.push('confirmReturn');

  return actions;
}

/**
 * Get allowed actions for renter based on reservation status
 * 
 * @param reservation - Reservation to check
 * @returns Array of allowed action types
 */
export function getRenterAllowedActions(reservation: Reservation): string[] {
  const actions: string[] = [];

  if (canPay(reservation)) actions.push('pay');
  if (canMarkPickup(reservation)) actions.push('markPickup');
  if (isRefundable(reservation)) actions.push('cancelWithRefund');
  if (canCancel(reservation)) actions.push('cancel');
  if (canDeleteByRenter(reservation)) actions.push('delete');
  if (canReview(reservation)) actions.push('review');

  return actions;
}

