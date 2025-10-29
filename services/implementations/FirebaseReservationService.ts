/**
 * Firebase Reservation Service Implementation
 * 
 * Concrete implementation of IReservationService using Firebase Firestore.
 * This is the default implementation used in production.
 */

import type { IReservationService } from '../interfaces';
import * as ReservationService from '../reservations/ReservationService';

/**
 * Firebase implementation of Reservation Service
 */
export class FirebaseReservationService implements IReservationService {
  createReservation = ReservationService.createReservation;
  getReservation = ReservationService.getReservation;
  listOwnerReservations = ReservationService.listOwnerReservations;
  listRenterReservations = ReservationService.listRenterReservations;
  listEligibleReservationsForReview = ReservationService.listEligibleReservationsForReview;
  subscribeToOwnerReservations = ReservationService.subscribeToOwnerReservations;
  subscribeToRenterReservations = ReservationService.subscribeToRenterReservations;
  acceptReservation = ReservationService.acceptReservation;
  rejectReservation = ReservationService.rejectReservation;
  deleteReservation = ReservationService.deleteReservation;
  updateReservationStatus = ReservationService.updateReservationStatus;
}

// Export singleton instance
export const firebaseReservationService = new FirebaseReservationService();

