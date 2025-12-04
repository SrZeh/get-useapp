/**
 * PickedUpActions - Actions when item is picked up
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface PickedUpActionsProps {
  reservation: Reservation;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function PickedUpActions({ reservation, onDelete }: PickedUpActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        Obrigado! A devolução agora pode ser confirmada pelo dono.
      </ThemedText>
      
      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[PickedUpActions] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          if (onDelete) {
            onDelete(reservation.id, reservation);
          } else {
            console.error('[PickedUpActions] onDelete handler is not provided!');
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

