// app/transaction/[id]/pay.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import {
  createCheckoutSession,
  confirmCheckoutSession,
} from "@/services/cloudFunctions";

export default function PayScreen() {
  const params = useLocalSearchParams();
  const raw = params.id as string | string[] | undefined;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const uid = auth.currentUser?.uid ?? null;

  const [busyCheckout, setBusyCheckout] = useState(false);
  const [busyConfirm, setBusyConfirm] = useState(false);

  // URLs de retorno (use http(s); pode trocar p/ seu domínio depois)
  const successUrl = useMemo(() => "https://example.com/stripe/success", []);
  const cancelUrl  = useMemo(() => "https://example.com/stripe/cancel",  []);

  async function startCheckout() {
    if (!uid || !id) return;
    try {
      setBusyCheckout(true);
      const { url } = await createCheckoutSession(id, successUrl, cancelUrl);

      await WebBrowser.openBrowserAsync(url);
      // Após pagar, o usuário fecha o browser e volta para o app.
      // O webhook deve marcar como "paid"; se não marcar, use o botão "Já paguei".
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha ao iniciar pagamento", error?.message ?? String(e));
    } finally {
      setBusyCheckout(false);
    }
  }

  async function confirmPaid() {
    if (!uid || !id) return;
    try {
      setBusyConfirm(true);
      await confirmCheckoutSession(id);
      Alert.alert("Pagamento confirmado", "Reserva marcada como paga e datas bloqueadas.");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Ainda não confirmado", error?.message ?? String(e));
    } finally {
      setBusyConfirm(false);
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
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">Pagamento</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.8 }}>
          Você será redirecionado ao Checkout seguro da Stripe. Pagamento por cartão.
          Após concluir, volte ao app. Se a reserva não mudar para “paga” automaticamente,
          toque em “Já paguei” para confirmar.
        </ThemedText>

        <View style={{ alignItems: "center", marginTop: 20, gap: 12 }}>
          <TouchableOpacity
            onPress={startCheckout}
            disabled={busyCheckout}
            style={{
              alignSelf: "center",
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 10,
              borderWidth: 1,
            }}
          >
            {busyCheckout
              ? <ActivityIndicator />
              : <ThemedText type="defaultSemiBold">Pagar com Stripe</ThemedText>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmPaid}
            disabled={busyConfirm}
            style={{
              alignSelf: "center",
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 10,
              borderWidth: 1,
            }}
          >
            {busyConfirm
              ? <ActivityIndicator />
              : <ThemedText>Já paguei</ThemedText>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
