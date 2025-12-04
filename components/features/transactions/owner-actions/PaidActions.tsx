/**
 * PaidActions - Status display for paid reservations (waiting for renter pickup)
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { getDepositMessage } from '@/utils';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface PaidActionsProps {
  reservation: Reservation;
  paymentMethodType?: string;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function PaidActions({ reservation, paymentMethodType, onDelete }: PaidActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>Pago 💙 — aguardando o locatário marcar &quot;Recebido!&quot;.</ThemedText>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        {getDepositMessage(paymentMethodType)}
      </ThemedText>
      
      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[OwnerPaidActions] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          if (onDelete) {
            console.log('[OwnerPaidActions] onDelete handler exists, calling it...');
            onDelete(reservation.id, reservation);
          } else {
            console.error('[OwnerPaidActions] onDelete handler is not provided!');
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

