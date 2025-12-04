/**
 * AcceptedActions - Actions for accepted reservations
 * 
 * When a reservation is accepted, the renter should be able to:
 * - Pay for the reservation
 * - Delete from list (before paid_out)
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface AcceptedActionsProps {
  reservation: Reservation;
  onPay: (id: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function AcceptedActions({
  reservation,
  onPay,
  onDelete,
}: AcceptedActionsProps) {
  const handlePay = () => {
    if (onPay) {
      onPay(reservation.id);
    }
  };

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <Button
        variant="primary"
        size="sm"
        onPress={handlePay}
      >
        Pagar
      </Button>

      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[AcceptedActions] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          console.log('[AcceptedActions] onDelete handler exists?', !!onDelete);
          console.log('[AcceptedActions] onDelete type:', typeof onDelete);
          if (onDelete) {
            console.log('[AcceptedActions] Calling onDelete handler...');
            try {
              onDelete(reservation.id, reservation);
              console.log('[AcceptedActions] onDelete handler called successfully');
            } catch (error) {
              console.error('[AcceptedActions] Error calling onDelete:', error);
            }
          } else {
            console.error('[AcceptedActions] onDelete handler is not provided!');
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

