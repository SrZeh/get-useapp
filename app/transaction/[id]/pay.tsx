// app/transaction/[id]/pay.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { useLocalSearchParams, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import * as Linking from "expo-linking";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/utils";
import {
  createMercadoPagoPayment,
} from "@/services/cloudFunctions";
import { Spacing } from "@/constants/spacing";
import { MercadoPagoCheckout } from "@/components/features/payments/MercadoPagoCheckout";

export default function PayScreen() {
  const params = useLocalSearchParams();
  const raw = params.id as string | string[] | undefined;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const uid = auth.currentUser?.uid ?? null;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [busyCheckout, setBusyCheckout] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  
  // Detectar retorno do pagamento via deep link
  const paymentStatus = params.status as string | string[] | undefined;
  const paymentId = params.payment_id as string | string[] | undefined;
  
  // Listener para deep links (iOS - fechar Safari View Controller)
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      console.log('[PayScreen] Deep link recebido:', url);
      
      // Se for um deep link do nosso app, fechar o Safari View Controller (iOS)
      if (url && url.includes('getanduseapp://')) {
        console.log('[PayScreen] Deep link do app detectado, fechando browser...');
        if (Platform.OS === 'ios') {
          WebBrowser.dismissBrowser();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Se retornou do pagamento, mostrar mensagem apropriada
    if (paymentStatus) {
      const status = Array.isArray(paymentStatus) ? paymentStatus[0] : paymentStatus;
      if (status === 'success') {
        Alert.alert(
          "✅ Pagamento Aprovado!",
          "Seu pagamento foi processado com sucesso. Você receberá uma confirmação em breve.",
          [
            {
              text: "Ver Reserva",
              onPress: () => router.replace(`/transaction/${id}`),
            },
          ]
        );
      } else if (status === 'failure' || status === 'rejected') {
        Alert.alert(
          "❌ Pagamento Falhou",
          "O pagamento não foi processado. Você pode tentar novamente.",
          [{ text: "OK" }]
        );
      } else if (status === 'pending') {
        Alert.alert(
          "⏳ Pagamento Pendente",
          "Seu pagamento está sendo processado. Você receberá uma notificação quando for confirmado.",
          [{ text: "OK" }]
        );
      }
    }
  }, [paymentStatus, id]);

  // URLs de retorno - redirecionam para deep links do app
  // O domínio padrão é o Firebase Hosting, mas pode ser configurado via EXPO_PUBLIC_SITE_URL
  const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? "https://upperreggae.web.app";
  const successUrl = useMemo(() => `${SITE_URL}/mercadopago/success`, [SITE_URL]);
  const cancelUrl  = useMemo(() => `${SITE_URL}/mercadopago/cancel`, [SITE_URL]);

  async function startCheckout() {
    if (!uid || !id) {
      console.warn('[PayScreen] UID ou ID não disponível');
      return;
    }
    
    try {
      setBusyCheckout(true);
      console.log('[PayScreen] Iniciando checkout...');
      console.log('[PayScreen] Platform:', Platform.OS);
      console.log('[PayScreen] ✅ Checkout mostrará TODAS as opções (PIX, cartão, boleto, etc.)');
      console.log('[PayScreen] Chamando createMercadoPagoPayment...');
      
      console.log('[PayScreen] Aguardando resposta da função...');
      // Não passar paymentMethod - o checkout mostrará todas as opções
      const result = await createMercadoPagoPayment(id, successUrl, cancelUrl);
      console.log('[PayScreen] ✅ Resposta recebida:', result);
      
      if (!result?.url && !result?.preferenceId) {
        console.error('[PayScreen] ❌ Resposta inválida - sem URL e sem preferenceId');
        throw new Error('URL ou Preference ID do checkout não foi retornada');
      }

      // Por enquanto, sempre abrir browser (SDK não está configurado ainda)
      // No futuro, quando SDK estiver configurado, usar preferenceId no web
      const shouldUseSDK = Platform.OS === 'web' && result.preferenceId && process.env.EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
      
      if (shouldUseSDK) {
        console.log('[PayScreen] Web detectado com SDK configurado - Usando SDK com preferenceId:', result.preferenceId);
        setPreferenceId(result.preferenceId);
        setBusyCheckout(false);
        // O componente MercadoPagoCheckout renderizará o botão
        return;
      }

      // Sempre abrir browser (web ou mobile)
      if (result.url) {
        console.log('[PayScreen] Abrindo browser com URL:', result.url);
        console.log('[PayScreen] Platform:', Platform.OS);
        console.log('[PayScreen] URL completa:', result.url);
        
        // Validar URL
        if (!result.url.startsWith('http://') && !result.url.startsWith('https://')) {
          throw new Error('URL do checkout inválida');
        }
        
        // Resetar busyCheckout antes de abrir browser (para não travar UI)
        setBusyCheckout(false);
        
        // No web, abrir checkout
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // Para web mobile, abrir na mesma janela (melhor compatibilidade)
          // Para desktop, tentar popup primeiro, se falhar abre na mesma janela
          const isMobileWeb = window.innerWidth < 768;
          
          if (isMobileWeb) {
            // Mobile web: abrir na mesma janela (evita problemas de CSP/cookies em popups)
            console.log('[PayScreen] Web mobile detectado - abrindo na mesma janela');
            window.location.href = result.url;
          } else {
            // Desktop: tentar popup primeiro
            const width = Math.min(600, window.innerWidth - 40);
            const height = Math.min(900, window.innerHeight - 40);
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            const newWindow = window.open(
              result.url,
              'mercadoPagoCheckout',
              `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );
            
            if (!newWindow) {
              // Se popup foi bloqueado, abrir na mesma janela
              console.log('[PayScreen] Popup bloqueado - abrindo na mesma janela');
              window.location.href = result.url;
            } else {
              // Monitorar quando a janela fechar
              const checkClosed = setInterval(() => {
                if (newWindow.closed) {
                  clearInterval(checkClosed);
                  console.log('[PayScreen] Janela do checkout fechada');
                }
              }, 500);
            }
          }
        } else {
          // Mobile: usar WebBrowser
          WebBrowser.openBrowserAsync(result.url, {
            presentationStyle: Platform.OS === 'ios' 
              ? WebBrowserPresentationStyle.FULLSCREEN 
              : WebBrowserPresentationStyle.AUTOMATIC,
            enableBarCollapsing: false,
          })
            .then((browserResult) => {
              console.log('[PayScreen] Browser aberto. Result:', browserResult);
              console.log('[PayScreen] Tipo de resultado:', browserResult.type);
              
              // Se o usuário cancelou, não é erro
              if (browserResult.type === 'cancel') {
                console.log('[PayScreen] Usuário cancelou o checkout');
              }
              
              // Após pagar, o usuário será redirecionado automaticamente pelo Mercado Pago.
              // O webhook do Mercado Pago marca como "paid" automaticamente.
            })
            .catch((browserError) => {
              console.error('[PayScreen] Erro ao abrir browser:', browserError);
              Alert.alert(
                "Erro ao abrir checkout",
                "Não foi possível abrir o checkout do Mercado Pago. Verifique sua conexão e tente novamente."
              );
            });
        }
      } else {
        throw new Error('URL do checkout não foi retornada');
      }
    } catch (e: unknown) {
      console.error('[PayScreen] Erro no checkout:', e);
      const error = e as { message?: string; code?: string; details?: any };
      const errorMessage = error?.message || error?.details?.message || String(e);
      Alert.alert("Falha ao iniciar pagamento", errorMessage);
    } finally {
      setBusyCheckout(false);
    }
  }

  if (!id) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ThemedText>Reserva inválida.</ThemedText>
      </ThemedView>
    );
  }
  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ThemedText>Faça login para pagar.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: Spacing.sm,
          paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
        }}
      >
        <ThemedText type="title">Pagamento</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.8 }}>
          Você será redirecionado ao Checkout seguro do Mercado Pago.
          Lá você poderá escolher entre PIX, cartão de crédito, cartão de débito, boleto e outros métodos disponíveis.
        </ThemedText>

        <View style={{ marginTop: 20, gap: 12 }}>

          {/* No mobile, mostrar botão para abrir browser */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={startCheckout}
              disabled={busyCheckout || !id || !uid}
              style={{
                alignSelf: "center",
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 10,
                backgroundColor: (busyCheckout || !id || !uid) 
                  ? colors.border.default 
                  : colors.brand.primary,
                minWidth: 200,
                alignItems: "center",
                opacity: (busyCheckout || !id || !uid) ? 0.6 : 1,
              }}
            >
              {busyCheckout
                ? <ActivityIndicator color={colors.isDark ? colors.text.primary : "#ffffff"} />
                : <ThemedText type="defaultSemiBold" style={{ color: (busyCheckout || !id || !uid) ? colors.text.secondary : (colors.isDark ? colors.text.primary : "#ffffff") }}>
                    Pagar com Mercado Pago
                  </ThemedText>}
            </TouchableOpacity>
          )}

          {/* No web, mostrar botão para inicializar SDK ou SDK já renderizado */}
          {Platform.OS === 'web' && (
            <>
              {!preferenceId ? (
                <TouchableOpacity
                  onPress={startCheckout}
                  disabled={busyCheckout || !id || !uid}
                  style={{
                    alignSelf: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 10,
                    backgroundColor: (busyCheckout || !id || !uid) 
                      ? colors.border.default 
                      : colors.brand.primary,
                    minWidth: 200,
                    alignItems: "center",
                    opacity: (busyCheckout || !id || !uid) ? 0.6 : 1,
                  }}
                >
                  {busyCheckout
                    ? <ActivityIndicator color={colors.isDark ? colors.text.primary : "#ffffff"} />
                    : <ThemedText type="defaultSemiBold" style={{ color: (busyCheckout || !id || !uid) ? colors.text.secondary : (colors.isDark ? colors.text.primary : "#ffffff") }}>
                        Iniciar Pagamento
                      </ThemedText>}
                </TouchableOpacity>
              ) : (
                <MercadoPagoCheckout
                  preferenceId={preferenceId}
                  onPaymentComplete={() => {
                    console.log('[PayScreen] Pagamento completo via SDK');
                    router.replace(`/transaction/${id}`);
                  }}
                  onPaymentError={(error) => {
                    console.error('[PayScreen] Erro no pagamento via SDK:', error);
                    Alert.alert("Erro no pagamento", error.message);
                    setPreferenceId(null);
                  }}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
