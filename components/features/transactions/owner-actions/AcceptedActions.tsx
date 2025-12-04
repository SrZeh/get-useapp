/**
 * AcceptedActions - Actions for accepted reservations
 * 
 * Status "accepted": Mostra "Aguardando pagamento" (só mensagem) + botão excluir
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import type { Reservation } from '../types';
import { Spacing } from '@/constants/spacing';

interface AcceptedActionsProps {
  reservation: Reservation;
  paymentMethodType?: string;
  onSyncStripe: () => void; // Mantido para compatibilidade, mas não será usado
  onDelete: (id: string, reservation: Reservation) => void;
  isSyncing: boolean;
}

export function AcceptedActions({
  reservation,
  paymentMethodType,
  onSyncStripe,
  onDelete,
  isSyncing,
}: AcceptedActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>⏳ Aguardando pagamento</ThemedText>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        O locatário precisa efetuar o pagamento para continuar.
      </ThemedText>
      
      {/* Botão excluir sempre disponível antes de paid_out */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          console.log('[OwnerAcceptedActions] Delete button clicked for reservation:', reservation.id, 'status:', reservation.status);
          if (onDelete) {
            console.log('[OwnerAcceptedActions] onDelete handler exists, calling it...');
            onDelete(reservation.id, reservation);
          } else {
            console.error('[OwnerAcceptedActions] onDelete handler is not provided!');
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

