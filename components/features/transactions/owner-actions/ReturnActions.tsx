/**
 * ReturnActions - Actions for confirming return of items
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';

interface ReturnActionsProps {
  reservationId: string;
  status: string;
  onConfirmReturn: (id: string) => void;
  isConfirming: boolean;
}

export function ReturnActions({
  reservationId,
  status,
  onConfirmReturn,
  isConfirming,
}: ReturnActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      {status === 'paid_out' && (
        <ThemedText>Repasse ao dono concluído ✅</ThemedText>
      )}
      <Button
        variant="primary"
        size="sm"
        onPress={() => onConfirmReturn(reservationId)}
        disabled={isConfirming}
        loading={isConfirming}
      >
        Confirmar devolução
      </Button>
    </View>
  );
}

