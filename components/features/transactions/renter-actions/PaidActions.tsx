/**
 * PaidActions - Actions for paid reservations (renter side)
 * 
 * When reservation is paid, renter can:
 * - Mark item as received
 * - Release payment to owner (after marking received and confirming item is as described)
 * - Cancel and request refund (if eligible)
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { canMarkPickup, isRefundable } from '@/services/reservations/ReservationRules';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface PaidActionsProps {
  reservation: Reservation;
  onMarkReceived: (id: string) => void;
  onReleasePayout: (id: string) => void;
  onCancelWithRefund: (id: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
  isMarkingReceived: boolean;
}

export function PaidActions({
  reservation,
  onMarkReceived,
  onReleasePayout,
  onCancelWithRefund,
  onDelete,
  isMarkingReceived,
}: PaidActionsProps) {
  // Can release payout if already marked as received (picked_up status)
  const canReleasePayout = reservation.status === 'picked_up' || !!reservation.pickedUpAt;

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      {canMarkPickup(reservation) && (
        <Button
          variant="primary"
          size="sm"
          onPress={() => onMarkReceived(reservation.id)}
          disabled={isMarkingReceived}
          loading={isMarkingReceived}
        >
          Recebido!
        </Button>
      )}

      {/* Liberar valor para o dono (após marcar recebido) */}
      {canReleasePayout && (
        <Button
          variant="primary"
          size="sm"
          onPress={() => onReleasePayout(reservation.id)}
        >
          Liberar valor para o dono
        </Button>
      )}

      {/* Cancelar com estorno enquanto for elegível */}
      {isRefundable(reservation) && (
        <Button
          variant="secondary"
          size="sm"
          onPress={() => onCancelWithRefund(reservation.id)}
        >
          Cancelar e pedir estorno
        </Button>
      )}
      {!isRefundable(reservation) && reservation.status === 'paid' && !reservation.pickedUpAt && (
        <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
          Estorno disponível por até 7 dias após o pagamento e antes de marcar &quot;Recebido!&quot;.
        </ThemedText>
      )}

      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[PaidActions] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          if (onDelete) {
            onDelete(reservation.id, reservation);
          } else {
            console.error('[PaidActions] onDelete handler is not provided!');
          }
        }}
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderWidth: 0,
        }}
        textStyle={{ color: '#ffffff' }}
      >
        Excluir da lista
      </Button>
    </View>
  );
}

