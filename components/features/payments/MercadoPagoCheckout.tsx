/**
 * MercadoPagoCheckout Component
 * 
 * Componente híbrido que usa o SDK do Mercado Pago no web e browser externo no mobile.
 * Segue o padrão multi-plataforma do projeto.
 */

import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/utils';
import * as WebBrowser from 'expo-web-browser';
import { Spacing } from '@/constants/spacing';

// Importação condicional do SDK (apenas web)
let Wallet: any = null;
let initMercadoPago: any = null;

if (Platform.OS === 'web') {
  try {
    const mercadoPagoSDK = require('@mercadopago/sdk-react');
    Wallet = mercadoPagoSDK.Wallet;
    initMercadoPago = mercadoPagoSDK.initMercadoPago;
  } catch (error) {
    console.warn('[MercadoPagoCheckout] SDK não disponível:', error);
  }
}

type MercadoPagoCheckoutProps = {
  preferenceId: string | null;
  onPaymentComplete?: () => void;
  onPaymentError?: (error: Error) => void;
};

/**
 * Componente de checkout do Mercado Pago
 * 
 * Web: Usa o SDK React do Mercado Pago para renderizar o botão de pagamento
 * Mobile: Usa browser externo (expo-web-browser) para abrir o checkout
 */
export function MercadoPagoCheckout({
  preferenceId,
  onPaymentComplete,
  onPaymentError,
}: MercadoPagoCheckoutProps) {
  const colors = useThemeColors();
  const [sdkReady, setSdkReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Inicializar SDK apenas no web
  useEffect(() => {
    if (Platform.OS === 'web' && initMercadoPago) {
      const key = process.env.EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
      if (key) {
        try {
          initMercadoPago(key);
          setPublicKey(key);
          setSdkReady(true);
          console.log('[MercadoPagoCheckout] SDK inicializado com sucesso');
        } catch (error) {
          console.error('[MercadoPagoCheckout] Erro ao inicializar SDK:', error);
          if (onPaymentError) {
            onPaymentError(error instanceof Error ? error : new Error('Erro ao inicializar SDK'));
          }
        }
      } else {
        console.warn('[MercadoPagoCheckout] EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY não configurada');
        if (onPaymentError) {
          onPaymentError(new Error('Public Key do Mercado Pago não configurada'));
        }
      }
    }
  }, [onPaymentError]);

  // No mobile, não renderizamos o SDK (usa browser externo)
  if (Platform.OS !== 'web') {
    return (
      <View style={{ padding: Spacing.md, alignItems: 'center' }}>
        <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
          No mobile, o checkout será aberto em um browser externo.
        </ThemedText>
      </View>
    );
  }

  // No web, renderizar o botão do SDK
  if (!sdkReady || !publicKey) {
    return (
      <View style={{ padding: Spacing.md, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.brand.primary} />
        <ThemedText 
          type="caption-1" 
          style={{ marginTop: Spacing.xs }}
          className="text-light-text-tertiary dark:text-dark-text-tertiary"
        >
          Carregando checkout...
        </ThemedText>
      </View>
    );
  }

  if (!preferenceId) {
    return (
      <View style={{ padding: Spacing.md, alignItems: 'center' }}>
        <ThemedText 
          type="callout"
          className="text-light-text-secondary dark:text-dark-text-secondary"
        >
          Aguardando preferência de pagamento...
        </ThemedText>
      </View>
    );
  }

  // Renderizar o botão Wallet do Mercado Pago
  if (!Wallet) {
    return (
      <View style={{ padding: Spacing.md, alignItems: 'center' }}>
        <ThemedText 
          type="callout"
          className="text-light-text-secondary dark:text-dark-text-secondary"
        >
          SDK do Mercado Pago não disponível. Use o botão de pagamento acima.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ padding: Spacing.md, alignItems: 'center' }}>
      <ThemedText 
        type="callout" 
        style={{ marginBottom: Spacing.sm }}
        className="text-light-text-secondary dark:text-dark-text-secondary"
      >
        Clique no botão abaixo para pagar:
      </ThemedText>
      <View style={{ width: '100%', maxWidth: 300, minHeight: 50 }}>
        <Wallet 
          initialization={{ preferenceId }}
          onReady={() => {
            console.log('[MercadoPagoCheckout] Botão Wallet pronto');
          }}
          onSubmit={() => {
            console.log('[MercadoPagoCheckout] Pagamento iniciado');
          }}
          onError={(error: any) => {
            console.error('[MercadoPagoCheckout] Erro no checkout:', error);
            if (onPaymentError) {
              onPaymentError(new Error(error?.message || 'Erro no checkout'));
            }
          }}
        />
      </View>
    </View>
  );
}

