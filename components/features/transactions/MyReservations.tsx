import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { markPickup, cancelWithRefund as cancelWithRefundService } from '@/services/cloudFunctions';
import { Alert } from 'react-native';
import type { Reservation } from './types';
import { useReservationService, useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { RenterReservationActions } from './renter-actions';

// chama a Cloud Function cancelWithRefund
async function cancelWithRefund(reservationId: string): Promise<void> {
  try {
    await cancelWithRefundService(reservationId);
    Alert.alert('Cancelada', 'Estorno solicitado. Pode levar alguns dias para aparecer no extrato.');
  } catch (e: unknown) {
    const error = e as { message?: string };
    Alert.alert('Não foi possível cancelar', error?.message ?? 'Tente novamente.');
  }
}

/**
 * MyReservations component - displays reservations for renters
 * 
 * Features:
 * - Pay for accepted reservations
 * - Mark items as received
 * - Cancel with refund (if eligible)
 * - Navigate to review flow
 */
export function MyReservations() {
  const reservationService = useReservationService();
  const navigation = useNavigationService();
  const uid = auth.currentUser?.uid ?? '';
  const [rows, setRows] = useState<Reservation[]>([]);
  const [busyPickId, setBusyPickId] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = reservationService.subscribeToRenterReservations(uid, (reservations) => {
      setRows(reservations);
    });
    return () => unsub();
  }, [uid, reservationService]);

  const removeMine = async (id: string, reservation: Reservation): Promise<void> => {
    try {
      await reservationService.deleteReservation(id);
      Alert.alert('Excluída', 'Reserva removida da sua lista.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Falha ao excluir', error?.message ?? String(e));
    }
  };

  async function markReceived(reservationId: string): Promise<void> {
    try {
      setBusyPickId(reservationId);
      await markPickup(reservationId);
      Alert.alert(
        'Recebido!',
        'Após o uso, lembre-se de devolver o item no prazo e avaliar, avaliações tornam nossa comunidade segura e confiável!'
      );
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Não foi possível marcar', error?.message ?? String(e));
    } finally {
      setBusyPickId(null);
    }
  }

  async function cancelWithRefund(reservationId: string): Promise<void> {
    try {
      await cancelWithRefundService(reservationId);
      Alert.alert('Cancelada', 'Estorno solicitado. Pode levar alguns dias para aparecer no extrato.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Não foi possível cancelar', error?.message ?? 'Tente novamente.');
    }
  }


  return (
    <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: Spacing.lg }}>
      {rows.length === 0 ? (
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.lg, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Você ainda não fez reservas.
          </ThemedText>
        </LiquidGlassView>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {rows.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              actions={
                <RenterReservationActions
                  reservation={r}
                  onPay={(id) => navigation.navigateToPayment(id)}
                  onMarkReceived={markReceived}
                  onCancelWithRefund={cancelWithRefund}
                  onDelete={removeMine}
                  onReview={(id) => navigation.navigateToReview(id)}
                  isMarkingReceived={busyPickId === r.id}
                />
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

