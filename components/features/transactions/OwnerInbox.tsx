import React, { useEffect, useState } from 'react';
import { ScrollView, View , Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { confirmReturn } from '@/services/cloudFunctions';
import { syncStripeAccount } from '@/services/stripe';

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
 * - Stripe onboarding sync
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
        const keep: Reservation[] = reservations.filter((r) =>
          ['requested', 'accepted', 'paid', 'picked_up', 'paid_out', 'returned'].includes(r.status)
        );
        console.log('[OwnerInbox] Filtered reservations:', keep.length);
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
      setBusyId(id);
      await reservationService.acceptReservation(id, uid);
      Alert.alert('Pedido aceito', 'O locatário já pode efetuar o pagamento.');
    } catch (e: unknown) {
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

  const removeReq = async (id: string): Promise<void> => {
    try {
      setBusyId(id);
      await reservationService.deleteReservation(id);
      Alert.alert('Excluída', 'Reserva removida.');
    } catch (e: unknown) {
      handleAsyncError(e, 'Falha ao excluir reserva', { reservationId: id, action: 'delete' });
    } finally {
      setBusyId(null);
    }
  };

  // Onboarding para receber (dono)
  async function syncStripe(): Promise<void> {
    try {
      setBusyAction('sync');
      await syncStripeAccount('http://localhost:8081/', 'http://localhost:8081/');
    } catch (error) {
      handleAsyncError(error, undefined, { action: 'syncStripe' });
    } finally {
      setBusyAction(null);
    }
  }

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

