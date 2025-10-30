/**
 * useItemReservation - Hook for handling item reservation requests
 * 
 * Handles:
 * - Reservation request logic
 * - Email verification check
 * - Date validation
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '@/lib/firebase';
import { router } from 'expo-router';
import { enumerateInclusive } from '@/utils';
import { useReservationService } from '@/providers/ServicesProvider';
import type { Item } from '@/types';

type UseItemReservationParams = {
  item: Item | null;
  startISO: string | null;
  endISOInc: string | null;
  endExclusive: string | null;
  daysCount: number;
  minDays: number;
  total: number;
  booked: Set<string>;
};

export function useItemReservation({
  item,
  startISO,
  endISOInc,
  endExclusive,
  daysCount,
  minDays,
  total,
  booked,
}: UseItemReservationParams) {
  const reservationService = useReservationService();
  const [submitting, setSubmitting] = useState(false);

  const requestReservation = async () => {
    const u = auth.currentUser;
    if (!u) {
      Alert.alert("Sessão", "Faça login para reservar.");
      return;
    }
    
    if (!item) return;
    
    if (!startISO || !endExclusive) {
      Alert.alert("Datas", "Selecione check-in e check-out.");
      return;
    }
    
    if (daysCount < minDays) {
      Alert.alert("Mínimo", `Este item exige ao menos ${minDays} dia(s).`);
      return;
    }
    
    if (endISOInc && Array.from(enumerateInclusive(startISO, endISOInc)).some((x) => booked.has(x))) {
      Alert.alert("Indisponível", "O intervalo inclui dias já ocupados.");
      return;
    }

    try {
      setSubmitting(true);
      
      // Force token refresh and check email verification
      await u.reload();
      if (!u.emailVerified) {
        Alert.alert(
          "E-mail não verificado",
          "Confirme seu e-mail para solicitar reservas."
        );
        router.push("/(auth)/verify-email");
        return;
      }
      
      await u.getIdToken(true); // Force refresh token for Security Rules

      // Calculate isFree from total (price equals zero)
      const isFree = total === 0;

      await reservationService.createReservation({
        itemId: item.id,
        itemTitle: item.title ?? "",
        itemOwnerUid: item.ownerUid ?? "",
        renterUid: u.uid,
        startDate: startISO,
        endDate: endExclusive,
        days: daysCount,
        total: total,
        isFree: isFree,
      });

      const message = isFree
        ? "Pedido enviado! Como é gratuito, após o dono aceitar, as datas serão bloqueadas automaticamente."
        : "Pedido enviado! Aguarde o dono aceitar para efetuar o pagamento.";

      Alert.alert("Pedido enviado!", message);
      router.back();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro", error?.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    requestReservation,
    submitting,
  };
}

