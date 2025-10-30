/**
 * PaidActions - Actions for paid reservations (mark received, refund options)
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
  onCancelWithRefund: (id: string) => void;
  isMarkingReceived: boolean;
}

export function PaidActions({
  reservation,
  onMarkReceived,
  onCancelWithRefund,
  isMarkingReceived,
}: PaidActionsProps) {
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
      {!isRefundable(reservation) && reservation.status === 'paid' && (
        <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
          Estorno disponível por até 7 dias após o pagamento e antes de marcar &quot;Recebido!&quot;.
        </ThemedText>
      )}
    </View>
  );
}

