import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { ReservationCard } from '@/components/ReservationCard';
import { auth } from '@/lib/firebase';
import { markPickup, cancelWithRefund as cancelWithRefundService } from '@/services/cloudFunctions';
import { Alert } from 'react-native';
import type { Reservation } from '@/types';
import { logger, useThemeColors } from '@/utils';
import { isRefundable, canDeleteByRenter, canMarkPickup, canPay, canReview } from '@/services/reservations/ReservationRules';
import { useReservationService, useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';

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
  const colors = useThemeColors();

  useEffect(() => {
    if (!uid) return;
    const unsub = reservationService.subscribeToRenterReservations(uid, (reservations) => {
      setRows(reservations);
    });
    return () => unsub();
  }, [uid, reservationService]);

  const removeMine = async (id: string, reservation: Reservation): Promise<void> => {
    if (!canDeleteByRenter(reservation)) {
      Alert.alert('Ação não permitida', 'Só é possível excluir pendentes, recusadas ou canceladas.');
      return;
    }
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
              canPay(r) ? (
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigateToPayment(r.id)}
                >
                  Pagar
                </Button>
              ) : r.status === 'paid' ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  {canMarkPickup(r) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => markReceived(r.id)}
                      disabled={busyPickId === r.id}
                      loading={busyPickId === r.id}
                    >
                      Recebido!
                    </Button>
                  )}

                  {/* Cancelar com estorno enquanto for elegível */}
                  {isRefundable(r) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() => cancelWithRefund(r.id)}
                    >
                      Cancelar e pedir estorno
                    </Button>
                  )}
                  {!isRefundable(r) && r.status === 'paid' && (
                    <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
                      Estorno disponível por até 7 dias após o pagamento e antes de marcar "Recebido!".
                    </ThemedText>
                  )}
                </View>
              ) : r.status === 'rejected' ? (
                <View style={{ gap: Spacing['2xs'] }}>
                  <ThemedText style={{ color: colors.semantic.error }}>Seu pedido foi recusado</ThemedText>
                  {canDeleteByRenter(r) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeMine(r.id, r)}
                    >
                      Excluir
                    </Button>
                  )}
                </View>
              ) : canDeleteByRenter(r) ? (
                <Button variant="ghost" size="sm" onPress={() => removeMine(r.id, r)}>
                  Excluir
                </Button>
              ) : r.status === 'picked_up' ? (
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                  Obrigado! A devolução agora pode ser confirmada pelo dono.
                </ThemedText>
              ) : canReview(r) ? (
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigateToReview(r.id)}
                >
                  Avaliar experiência
                </Button>
              ) : r.status === 'paid_out' ? (
                <ThemedText type="defaultSemiBold">Pagamento repassado ao dono ✅</ThemedText>
              ) : null
            }
          />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

