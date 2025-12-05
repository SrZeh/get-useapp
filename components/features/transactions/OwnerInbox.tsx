import React, { useEffect, useState } from 'react';
import { ScrollView, View , Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { confirmReturn } from '@/services/cloudFunctions';
// Removido: syncStripeAccount - agora usando Asaas

import { handleAsyncError } from '@/utils';
import type { Reservation } from './types';
import { useReservationService, useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { OwnerReservationActions } from './owner-actions';
import { Footer } from '@/components/Footer';

/**
 * OwnerInbox component - displays reservations for item owners
 * 
 * Features:
 * - Accept/reject reservation requests
 * - Asaas account management
 * - Confirm returns
 * - Deposit messages
 */
export function OwnerInbox() {
  const reservationService = useReservationService();
  const navigation = useNavigationService();
  const uid = auth.currentUser?.uid ?? '';
  const [rows, setRows] = useState<Reservation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const unsub = reservationService.subscribeToOwnerReservations(
      uid,
      (reservations) => {
        console.log('[OwnerInbox] Received reservations:', reservations.length);
        console.log('[OwnerInbox] Reservations statuses:', reservations.map(r => ({ id: r.id, status: r.status })));
        // Filtrar reservas closed (ocultas) e manter apenas status ativos
        const keep: Reservation[] = reservations.filter((r) =>
          ['requested', 'accepted', 'paid', 'picked_up', 'paid_out', 'returned'].includes(r.status) &&
          r.status !== 'closed'
        );
        console.log('[OwnerInbox] Filtered reservations:', keep.length, 'Statuses:', keep.map(r => r.status));
        setRows(keep);
        setLoading(false);
      },
      ['requested', 'accepted', 'paid', 'picked_up', 'paid_out', 'returned']
    );
    
    return () => {
      unsub();
      setLoading(false);
    };
  }, [uid, reservationService]);

  const accept = async (id: string): Promise<void> => {
    try {
      console.log('[OwnerInbox] Accepting reservation:', id);
      setBusyId(id);
      const result = await reservationService.acceptReservation(id, uid);
      console.log('[OwnerInbox] Reservation accepted successfully:', id, result);
      // Wait a bit for Firestore to propagate the update
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Pedido aceito', 'O locatário já pode efetuar o pagamento.');
    } catch (e: unknown) {
      console.error('[OwnerInbox] Error accepting reservation:', e);
      handleAsyncError(e, 'Falha ao aceitar reserva', { reservationId: id, action: 'accept' });
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string): Promise<void> => {
    try {
      setBusyId(id);
      await reservationService.rejectReservation(id, uid);
      Alert.alert('Reserva recusada.');
    } catch (e: unknown) {
      handleAsyncError(e, 'Falha ao recusar reserva', { reservationId: id, action: 'reject' });
    } finally {
      setBusyId(null);
    }
  };

  const removeReq = async (id: string, reservation: Reservation): Promise<void> => {
    // Se pode deletar diretamente (requested, rejected, canceled)
    const canDelete = ['requested', 'rejected', 'canceled'].includes(reservation.status);
    
    if (canDelete) {
      try {
        setBusyId(id);
        await reservationService.deleteReservation(id);
        Alert.alert('Excluída', 'Reserva removida.');
      } catch (e: unknown) {
        handleAsyncError(e, 'Falha ao excluir reserva', { reservationId: id, action: 'delete' });
      } finally {
        setBusyId(null);
      }
      return;
    }

    // Para outros status, apenas marca como closed (oculta da lista)
    // Executa diretamente, igual ao rejectReservation
    try {
      setBusyId(id);
      await reservationService.closeReservation(id);
      Alert.alert('Excluída', 'Reserva removida da sua lista.');
    } catch (e: unknown) {
      handleAsyncError(e, 'Falha ao excluir reserva', { reservationId: id, action: 'close' });
    } finally {
      setBusyId(null);
    }
  };

  // Função vazia - Asaas faz split automático
  // Mantida para compatibilidade com OwnerReservationActions
  const syncStripe = () => {
    // Não faz nada - Asaas faz split automático, não precisa de sync
  };

  // Confirmar devolução (sem foto)
  async function confirmReturnLocal(reservationId: string): Promise<void> {
    try {
      setBusyAction(`return:${reservationId}`);
      await confirmReturn(reservationId, ''); // Empty photoUrl for non-photo returns
      Alert.alert('Devolução', 'Devolução confirmada. Avaliações liberadas para o locatário.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Devolução', error?.message ?? 'Falha ao confirmar devolução.');
    } finally {
      setBusyAction(null);
    }
  }


  if (loading) {
    return (
      <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: 0 }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.lg, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Carregando reservas...
          </ThemedText>
        </LiquidGlassView>
        <Footer />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: 0 }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.lg, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center', color: 'red' }}>
            Erro ao carregar reservas: {error}
          </ThemedText>
        </LiquidGlassView>
        <Footer />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: 0 }}>
      {rows.length === 0 ? (
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.lg, alignItems: 'center' }}>
          <ThemedText type="title" style={{ textAlign: 'center' }}>
            Nenhuma reserva para mostrar.
          </ThemedText>
        </LiquidGlassView>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {rows.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              viewerRole="owner"
              actions={
                <OwnerReservationActions
                  reservation={r}
                  onAccept={accept}
                  onReject={reject}
                  onDelete={removeReq}
                  onSyncStripe={syncStripe}
                  onConfirmReturn={confirmReturnLocal}
                  onReviewRenter={(id) => navigation.navigateToOwnerReview(id)}
                  isBusy={busyId === r.id}
                  isSyncing={busyAction === 'sync'}
                  isConfirming={busyAction === `return:${r.id}`}
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

