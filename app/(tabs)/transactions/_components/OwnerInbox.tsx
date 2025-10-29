import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { confirmReturn } from '@/services/cloudFunctions';
import { syncStripeAccount } from '@/services/stripe';
import { Alert } from 'react-native';
import { handleAsyncError, logger, getDepositMessage } from '@/utils';
import type { Reservation } from '@/types';
import { canAccept, canReject, canDeleteByOwner, canConfirmReturn } from '@/services/reservations/ReservationRules';
import { Button } from '@/components/Button';
import { useReservationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';

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
  const uid = auth.currentUser?.uid ?? '';
  const [rows, setRows] = useState<Reservation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = reservationService.subscribeToOwnerReservations(
      uid,
      (reservations) => {
        const keep: Reservation[] = reservations.filter((r) =>
          ['requested', 'accepted', 'paid', 'picked_up', 'paid_out', 'returned'].includes(r.status)
        );
        setRows(keep);
      },
      ['requested', 'accepted', 'paid', 'picked_up', 'paid_out', 'returned']
    );
    return () => unsub();
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


  return (
    <ScrollView style={{ padding: Spacing.sm }} contentContainerStyle={{ paddingBottom: Spacing.lg }}>
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
              actions={
              canAccept(r) ? (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    {canAccept(r) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => accept(r.id)}
                        disabled={busyId === r.id}
                        loading={busyId === r.id}
                      >
                        Aceitar
                      </Button>
                    )}
                    {canReject(r) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onPress={() => reject(r.id)}
                        disabled={busyId === r.id}
                        loading={busyId === r.id}
                      >
                        Recusar
                      </Button>
                    )}
                  </View>
                  {canDeleteByOwner(r) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeReq(r.id)}
                      disabled={busyId === r.id}
                      loading={busyId === r.id}
                    >
                      Excluir reserva
                    </Button>
                  )}
                </View>
              ) : r.status === 'accepted' ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={syncStripe}
                    disabled={busyAction === 'sync'}
                    loading={busyAction === 'sync'}
                  >
                    Sincronizar conta Stripe
                  </Button>
                  <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
                    {getDepositMessage(r.paymentMethodType)}
                  </ThemedText>
                </View>
              ) : r.status === 'paid' ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  <ThemedText>Pago 💙 — aguardando o locatário marcar "Recebido!".</ThemedText>
                  <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
                    {getDepositMessage(r.paymentMethodType)}
                  </ThemedText>
                </View>
              ) : canConfirmReturn(r) ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  {r.status === 'paid_out' && <ThemedText>Repasse ao dono concluído ✅</ThemedText>}
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => confirmReturnLocal(r.id)}
                    disabled={busyAction === `return:${r.id}`}
                    loading={busyAction === `return:${r.id}`}
                  >
                    Confirmar devolução
                  </Button>
                </View>
              ) : r.status === 'returned' ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
                </View>
              ) : null
            }
          />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

