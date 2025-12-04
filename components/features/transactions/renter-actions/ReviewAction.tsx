/**
 * ReviewAction - Button to navigate to review flow + delete option
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface ReviewActionProps {
  reservation: Reservation;
  onReview: (id: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function ReviewAction({ reservation, onReview, onDelete }: ReviewActionProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <Button
        variant="primary"
        size="sm"
        onPress={() => onReview(reservation.id)}
      >
        Avaliar experiência
      </Button>
      
      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[ReviewAction] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          if (onDelete) {
            onDelete(reservation.id, reservation);
          } else {
            console.error('[ReviewAction] onDelete handler is not provided!');
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

