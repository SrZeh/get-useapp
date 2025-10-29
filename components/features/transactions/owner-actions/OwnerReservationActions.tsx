/**
 * OwnerReservationActions - Main component that renders appropriate actions
 * based on reservation status. Reduces nesting depth in OwnerInbox.
 */

import React from 'react';
import { canAccept, canConfirmReturn } from '@/services/reservations/ReservationRules';
import type { Reservation } from '../types';
import { RequestActions } from './RequestActions';
import { AcceptedActions } from './AcceptedActions';
import { PaidActions } from './PaidActions';
import { ReturnActions } from './ReturnActions';
import { ReturnedActions } from './ReturnedActions';

interface OwnerReservationActionsProps {
  reservation: Reservation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onSyncStripe: () => void;
  onConfirmReturn: (id: string) => void;
  isBusy: boolean;
  isSyncing: boolean;
  isConfirming: boolean;
}

/**
 * Determines and renders the appropriate actions for an owner's reservation
 * based on its current status. Uses early returns to reduce nesting.
 */
export function OwnerReservationActions({
  reservation,
  onAccept,
  onReject,
  onDelete,
  onSyncStripe,
  onConfirmReturn,
  isBusy,
  isSyncing,
  isConfirming,
}: OwnerReservationActionsProps) {
  // Requested status - can accept/reject/delete
  if (canAccept(reservation)) {
    return (
      <RequestActions
        reservation={reservation}
        onAccept={onAccept}
        onReject={onReject}
        onDelete={onDelete}
        isBusy={isBusy}
      />
    );
  }

  // Accepted status - need to sync Stripe
  if (reservation.status === 'accepted') {
    return (
      <AcceptedActions
        paymentMethodType={reservation.paymentMethodType}
        onSyncStripe={onSyncStripe}
        isSyncing={isSyncing}
      />
    );
  }

  // Paid status - waiting for pickup
  if (reservation.status === 'paid') {
    return <PaidActions paymentMethodType={reservation.paymentMethodType} />;
  }

  // Can confirm return
  if (canConfirmReturn(reservation)) {
    return (
      <ReturnActions
        reservationId={reservation.id}
        status={reservation.status}
        onConfirmReturn={onConfirmReturn}
        isConfirming={isConfirming}
      />
    );
  }

  // Returned status
  if (reservation.status === 'returned') {
    return <ReturnedActions />;
  }

  // No actions available
  return null;
}

