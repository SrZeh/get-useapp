/**
 * RenterReservationActions - Main component that renders appropriate actions
 * based on reservation status for renters. Reduces nesting depth in MyReservations.
 */

import React from 'react';
import { canPay, canDeleteByRenter, canReview } from '@/services/reservations/ReservationRules';
import type { Reservation } from '../types';
import { PayAction } from './PayAction';
import { PaidActions } from './PaidActions';
import { RejectedActions } from './RejectedActions';
import { DeleteAction } from './DeleteAction';
import { PickedUpActions } from './PickedUpActions';
import { ReviewAction } from './ReviewAction';
import { PaidOutAction } from './PaidOutAction';

interface RenterReservationActionsProps {
  reservation: Reservation;
  onPay: (id: string) => void;
  onMarkReceived: (id: string) => void;
  onCancelWithRefund: (id: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
  onReview: (id: string) => void;
  isMarkingReceived: boolean;
}

/**
 * Determines and renders the appropriate actions for a renter's reservation
 * based on its current status. Uses early returns to reduce nesting.
 */
export function RenterReservationActions({
  reservation,
  onPay,
  onMarkReceived,
  onCancelWithRefund,
  onDelete,
  onReview,
  isMarkingReceived,
}: RenterReservationActionsProps) {
  // Can pay - accepted status
  if (canPay(reservation)) {
    return <PayAction reservationId={reservation.id} onPay={onPay} />;
  }

  // Paid status - can mark received and request refund
  if (reservation.status === 'paid') {
    return (
      <PaidActions
        reservation={reservation}
        onMarkReceived={onMarkReceived}
        onCancelWithRefund={onCancelWithRefund}
        isMarkingReceived={isMarkingReceived}
      />
    );
  }

  // Rejected status
  if (reservation.status === 'rejected') {
    return (
      <RejectedActions
        reservation={reservation}
        onDelete={onDelete}
      />
    );
  }

  // Can delete - requested, rejected, or canceled
  if (canDeleteByRenter(reservation)) {
    return (
      <DeleteAction
        reservation={reservation}
        onDelete={onDelete}
      />
    );
  }

  // Picked up status
  if (reservation.status === 'picked_up') {
    return <PickedUpActions />;
  }

  // Can review
  if (canReview(reservation)) {
    return (
      <ReviewAction
        reservationId={reservation.id}
        onReview={onReview}
      />
    );
  }

  // Paid out status
  if (reservation.status === 'paid_out') {
    return <PaidOutAction />;
  }

  // No actions available
  return null;
}

