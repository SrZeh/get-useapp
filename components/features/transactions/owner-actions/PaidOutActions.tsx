/**
 * PaidOutActions - Actions when payout has been released (owner can access Mercado Pago)
 */

import React from 'react';
import { View, Linking } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';

interface PaidOutActionsProps {
  paymentMethodType?: string;
}

export function PaidOutActions({ paymentMethodType }: PaidOutActionsProps) {
  const handleOpenMercadoPago = () => {
    // Abrir painel do Mercado Pago para saques
    const url = 'https://www.mercadopago.com.br/activities/balance';
    Linking.openURL(url).catch((error) => {
      console.error('[PaidOutActions] Erro ao abrir Mercado Pago:', error);
    });
  };

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>✅ Pagamento liberado</ThemedText>
      <Button
        variant="primary"
        size="sm"
        onPress={handleOpenMercadoPago}
      >
        💰 Acessar Mercado Pago
      </Button>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        Acesse seu painel para ver saldo e fazer saques
      </ThemedText>
    </View>
  );
}

