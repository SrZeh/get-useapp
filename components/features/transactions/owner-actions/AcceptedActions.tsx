/**
 * AcceptedActions - Actions for accepted reservations (Mercado Pago)
 */

import React from 'react';
import { View, Linking, Platform } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { getDepositMessage } from '@/utils';
import { Spacing } from '@/constants/spacing';

interface AcceptedActionsProps {
  paymentMethodType?: string;
  onSyncStripe: () => void; // Mantido para compatibilidade, mas não será usado
  isSyncing: boolean;
}

export function AcceptedActions({
  paymentMethodType,
  onSyncStripe,
  isSyncing,
}: AcceptedActionsProps) {
  const handleOpenMercadoPago = () => {
    // Abrir painel do Mercado Pago para saques
    const url = 'https://www.mercadopago.com.br/activities/balance';
    Linking.openURL(url).catch((error) => {
      console.error('[AcceptedActions] Erro ao abrir Mercado Pago:', error);
    });
  };

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <Button
        variant="secondary"
        size="sm"
        onPress={handleOpenMercadoPago}
        disabled={false}
        loading={false}
      >
        💰 Acessar Mercado Pago
      </Button>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        Acesse seu painel para ver saldo e fazer saques
      </ThemedText>
      {getDepositMessage(paymentMethodType) && (
        <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
          {getDepositMessage(paymentMethodType)}
        </ThemedText>
      )}
    </View>
  );
}

