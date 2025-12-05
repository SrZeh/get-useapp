/**
 * PaidOutActions - Actions when payout has been released (owner can access Asaas)
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
  const handleOpenAsaas = () => {
    // Abrir painel do Asaas para saques
    const url = 'https://app.asaas.com/';
    Linking.openURL(url).catch((error) => {
      console.error('[PaidOutActions] Erro ao abrir Asaas:', error);
    });
  };

  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>✅ Pagamento liberado</ThemedText>
      <Button
        variant="primary"
        size="sm"
        onPress={handleOpenAsaas}
      >
        💰 Acessar Asaas
      </Button>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        Acesse seu painel Asaas para ver saldo e fazer saques
      </ThemedText>
    </View>
  );
}



