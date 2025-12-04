/**
 * RequestActions - Actions for requested reservations (owner can accept/reject)
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { canAccept, canReject, canDeleteByOwner } from '@/services/reservations/ReservationRules';
import type { Reservation } from '../types';

interface RequestActionsProps {
  reservation: Reservation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
  isBusy: boolean;
}

export function RequestActions({
  reservation,
  onAccept,
  onReject,
  onDelete,
  isBusy,
}: RequestActionsProps) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {canAccept(reservation) && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => onAccept(reservation.id)}
            disabled={isBusy}
            loading={isBusy}
          >
            Aceitar
          </Button>
        )}
        {canReject(reservation) && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => onReject(reservation.id)}
            disabled={isBusy}
            loading={isBusy}
          >
            Recusar
          </Button>
        )}
      </View>
      {canDeleteByOwner(reservation) && (
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onDelete(reservation.id, reservation)}
          disabled={isBusy}
          loading={isBusy}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 0,
          }}
          textStyle={{ color: '#ffffff' }}
        >
          Excluir reserva
        </Button>
      )}
    </View>
  );
}

