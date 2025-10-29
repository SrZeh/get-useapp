/**
 * RejectedActions - Actions for rejected reservations
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { canDeleteByRenter } from '@/services/reservations/ReservationRules';
import { useThemeColors } from '@/utils';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface RejectedActionsProps {
  reservation: Reservation;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function RejectedActions({ reservation, onDelete }: RejectedActionsProps) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText style={{ color: colors.semantic.error }}>
        Seu pedido foi recusado
      </ThemedText>
      {canDeleteByRenter(reservation) && (
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
          Excluir
        </Button>
      )}
    </View>
  );
}

