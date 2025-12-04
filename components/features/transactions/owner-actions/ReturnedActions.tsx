/**
 * ReturnedActions - Status display for returned items
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import type { Reservation } from '../types';

type ReturnedActionsProps = {
  reservation: Reservation;
  canReviewRenter: boolean;
  onReviewRenter: (reservationId: string) => void;
  onDelete: (id: string, reservation: Reservation) => void;
};

export function ReturnedActions({ reservation, canReviewRenter, onReviewRenter, onDelete }: ReturnedActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
      {canReviewRenter ? (
        <Button
          variant="primary"
          size="sm"
          onPress={() => onReviewRenter(reservation.id)}
          style={{ alignSelf: 'flex-start' }}
        >
          Avaliar locatário
        </Button>
      ) : (
        <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
          Você já avaliou o locatário.
        </ThemedText>
      )}
      
      {/* Botão excluir sempre disponível antes de paid_out */}
      {reservation.status !== 'paid_out' && (
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onDelete(reservation.id, reservation)}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 0,
          }}
          textStyle={{ color: '#ffffff' }}
        >
          Excluir da lista
        </Button>
      )}
    </View>
  );
}

