/**
 * RenterReservationActions - Main component that renders appropriate actions
 * based on reservation status for renters. Reduces nesting depth in MyReservations.
 */

import React from 'react';
import { canPay, canDeleteByRenter, canReview } from '@/services/reservations/ReservationRules';
import type { Reservation } from '../types';
import { PayAction } from './PayAction';
import { AcceptedActions } from './AcceptedActions';
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
  onReleasePayout: (id: string) => void;
  onCancelWithRefund: (id: string) => void;
  onCancelAccepted: (id: string) => void;
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
  onReleasePayout,
  onCancelWithRefund,
  onCancelAccepted,
  onDelete,
  onReview,
  isMarkingReceived,
}: RenterReservationActionsProps) {
  // Can pay - accepted status (only pay button)
  if (canPay(reservation)) {
    return (
      <AcceptedActions
        reservation={reservation}
        onPay={onPay}
        onDelete={onDelete}
      />
    );
  }

  // Paid status - can mark received, release payout, and request refund
  if (reservation.status === 'paid') {
    return (
      <PaidActions
        reservation={reservation}
        onMarkReceived={onMarkReceived}
        onReleasePayout={onReleasePayout}
        onCancelWithRefund={onCancelWithRefund}
        onDelete={onDelete}
        isMarkingReceived={isMarkingReceived}
      />
    );
  }

  // Picked up status - can release payout
  if (reservation.status === 'picked_up') {
    return (
      <PaidActions
        reservation={reservation}
        onMarkReceived={onMarkReceived}
        onReleasePayout={onReleasePayout}
        onCancelWithRefund={onCancelWithRefund}
        onDelete={onDelete}
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
    return <PickedUpActions reservation={reservation} onDelete={onDelete} />;
  }

  // Can review
  if (canReview(reservation)) {
    return (
      <ReviewAction
        reservation={reservation}
        onReview={onReview}
        onDelete={onDelete}
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

