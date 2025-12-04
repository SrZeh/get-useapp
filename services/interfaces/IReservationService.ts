/**
 * Reservation Service Interface
 * 
 * Defines the contract for reservation-related operations.
 * Allows for easy swapping of implementations and mocking in tests.
 */

import type { Reservation, ReservationStatus, NewReservationInput, EligibleReservation } from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

/**
 * Reservation Service Interface
 */
export interface IReservationService {
  /**
   * Create a new reservation
   * @param input - Reservation input data
   * @returns Created reservation ID
   */
  createReservation(input: NewReservationInput): Promise<string>;

  /**
   * Get a reservation by ID
   * @param reservationId - Reservation ID
   * @returns Reservation or null if not found
   */
  getReservation(reservationId: string): Promise<Reservation | null>;

  /**
   * List reservations for a specific owner
   * @param ownerUid - Owner user ID
   * @param statusFilter - Optional status filter
   * @returns Array of reservations
   */
  listOwnerReservations(ownerUid: string, statusFilter?: ReservationStatus[]): Promise<Reservation[]>;

  /**
   * List reservations for a specific renter
   * @param renterUid - Renter user ID
   * @returns Array of reservations
   */
  listRenterReservations(renterUid: string): Promise<Reservation[]>;

  /**
   * List eligible reservations for review (completed reservations)
   * @param renterUid - Renter user ID
   * @param itemId - Item ID
   * @returns Array of eligible reservations with labels
   */
  listEligibleReservationsForReview(renterUid: string, itemId: string): Promise<EligibleReservation[]>;

  /**
   * List eligible reservations for user-to-user reviews (completed reservations)
   * @param uid - User ID
   * @param role - Role of the user (owner or renter)
   */
  listEligibleReservationsForUserReview(uid: string, role: 'owner' | 'renter'): Promise<EligibleReservation[]>;

  /**
   * Subscribe to owner reservations with real-time updates
   * @param ownerUid - Owner user ID
   * @param callback - Callback function for updates
   * @param statusFilter - Optional status filter
   * @returns Unsubscribe function
   */
  subscribeToOwnerReservations(
    ownerUid: string,
    callback: (reservations: Reservation[]) => void,
    statusFilter?: ReservationStatus[]
  ): Unsubscribe;

  /**
   * Subscribe to renter reservations with real-time updates
   * @param renterUid - Renter user ID
   * @param callback - Callback function for updates
   * @returns Unsubscribe function
   */
  subscribeToRenterReservations(renterUid: string, callback: (reservations: Reservation[]) => void): Unsubscribe;

  /**
   * Subscribe to help offer reservations (where user needs help)
   * @param ownerUid - Owner user ID (person who needs help)
   * @param callback - Callback function for updates
   * @returns Unsubscribe function
   */
  subscribeToHelpOfferReservations(ownerUid: string, callback: (reservations: Reservation[]) => void): Unsubscribe;

  /**
   * Accept a reservation (owner action)
   * @param reservationId - Reservation ID
   * @param ownerUid - Owner user ID
   */
  acceptReservation(reservationId: string, ownerUid: string): Promise<void>;

  /**
   * Reject a reservation (owner action)
   * @param reservationId - Reservation ID
   * @param ownerUid - Owner user ID
   * @param reason - Optional rejection reason
   */
  rejectReservation(reservationId: string, ownerUid: string, reason?: string): Promise<void>;

  /**
   * Delete a reservation
   * @param reservationId - Reservation ID
   */
  deleteReservation(reservationId: string): Promise<void>;

  /**
   * Update reservation status
   * @param reservationId - Reservation ID
   * @param status - New status
   * @param additionalData - Optional additional fields to update
   */
  updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    additionalData?: Record<string, unknown>
  ): Promise<void>;

  /**
   * Close a reservation (marks as closed, hiding it from user lists)
   * @param reservationId - Reservation ID
   */
  closeReservation(reservationId: string): Promise<void>;
}

