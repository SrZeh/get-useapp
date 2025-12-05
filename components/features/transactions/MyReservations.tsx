import React, { useEffect, useState } from 'react';
import { ScrollView, View , Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { markPickup, cancelWithRefund as cancelWithRefundService, cancelAcceptedReservation, releasePayoutToOwner } from '@/services/cloudFunctions';

import type { Reservation } from './types';
import { useReservationService, useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { RenterReservationActions } from './renter-actions';
import { Footer } from '@/components/Footer';

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
      console.log('[MyReservations] Received reservations:', reservations.length);
      console.log('[MyReservations] Reservations by status:', reservations.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      // Filtrar reservas closed (ocultas)
      const visible = reservations.filter((r) => r.status !== 'closed');
      setRows(visible);
    });
    return () => unsub();
  }, [uid, reservationService]);

  const removeMine = async (id: string, reservation: Reservation): Promise<void> => {
    // Se pode deletar diretamente (requested, rejected, canceled)
    const canDelete = ['requested', 'rejected', 'canceled'].includes(reservation.status);
    
    if (canDelete) {
      try {
        await reservationService.deleteReservation(id);
        Alert.alert('Excluída', 'Reserva removida da sua lista.');
      } catch (e: unknown) {
        const error = e as { message?: string };
        Alert.alert('Falha ao excluir', error?.message ?? String(e));
      }
      return;
    }

    // Para outros status, apenas marca como closed (oculta da lista)
    // Executa diretamente, igual ao rejectReservation
    try {
      await reservationService.closeReservation(id);
      Alert.alert('Excluída', 'Reserva removida da sua lista.');
    } catch (e: unknown) {
      const error = e as { message?: string; code?: string };
      const errorMessage = error?.message ?? error?.code ?? String(e);
      Alert.alert('Falha ao excluir', errorMessage);
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

  const cancelAccepted = (reservationId: string) => {
    console.log('[MyReservations] cancelAccepted called for:', reservationId);
    Alert.alert(
      'Cancelar reserva',
      'Tem certeza que deseja cancelar esta reserva? A ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[MyReservations] Calling cancelAcceptedReservation for:', reservationId);
              await cancelAcceptedReservation(reservationId);
              console.log('[MyReservations] cancelAcceptedReservation succeeded');
              Alert.alert('Cancelada', 'Reserva cancelada com sucesso.');
            } catch (e: unknown) {
              console.error('[MyReservations] cancelAcceptedReservation error:', e);
              const error = e as { message?: string };
              Alert.alert('Não foi possível cancelar', error?.message ?? 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  async function releasePayout(reservationId: string): Promise<void> {
    try {
      await releasePayoutToOwner(reservationId);
      Alert.alert('Pagamento liberado', 'O pagamento foi liberado para o dono. Ele pode sacar no Asaas.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Erro', error?.message ?? 'Não foi possível liberar o pagamento. Tente novamente.');
    }
  }


  return (
    <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: 0 }}>
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
                  onReleasePayout={releasePayout}
                  onCancelWithRefund={cancelWithRefund}
                  onCancelAccepted={cancelAccepted}
                  onDelete={removeMine}
                  onReview={(id) => navigation.navigateToReview(id)}
                  isMarkingReceived={busyPickId === r.id}
                />
              }
            />
          ))}
        </View>
      )}
      <Footer />
    </ScrollView>
  );
}

