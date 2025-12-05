/**
 * ReservationTimestamps - Displays all timestamp information for a reservation
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { formatTimestamp } from '@/utils/reservations';
import { Spacing } from '@/constants/spacing';
import type { FirestoreTimestamp } from '@/types/firestore';
import type { ReservationStatus } from '@/types';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ReservationTimestampsProps = {
  status: ReservationStatus;
  paidAt?: unknown;
  acceptedAt?: unknown;
  pickedUpAt?: unknown;
  returnedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  pickedUpBy?: string;
  asaasPaymentId?: string;
  transferGroup?: string;
  reviewsOpen?: {
    renterCanReviewOwner?: boolean;
    renterCanReviewItem?: boolean;
    ownerCanReviewRenter?: boolean;
  };
  viewerRole: 'owner' | 'renter';
  colors: UseThemeColorsReturn;
};

export const ReservationTimestamps = React.memo(function ReservationTimestamps({
  status,
  paidAt,
  acceptedAt,
  pickedUpAt,
  returnedAt,
  createdAt,
  updatedAt,
  pickedUpBy,
  asaasPaymentId,
  transferGroup,
  reviewsOpen,
  viewerRole,
  colors,
}: ReservationTimestampsProps) {
  // Format timestamps
  const paidAtFormatted = useMemo(() => formatTimestamp(paidAt), [paidAt]);
  const acceptedAtFormatted = useMemo(() => formatTimestamp(acceptedAt), [acceptedAt]);
  const pickedUpAtFormatted = useMemo(() => formatTimestamp(pickedUpAt), [pickedUpAt]);
  const returnedAtFormatted = useMemo(() => formatTimestamp(returnedAt), [returnedAt]);
  const createdAtFormatted = useMemo(() => formatTimestamp(createdAt), [createdAt]);
  const updatedAtFormatted = useMemo(
    () => formatTimestamp(updatedAt as FirestoreTimestamp),
    [updatedAt]
  );

  // Status-specific timestamp to show
  const statusTimestamp = useMemo(() => {
    if (returnedAtFormatted && status === 'returned')
      return { label: 'Devolvido em', value: returnedAtFormatted, icon: '✅' };
    if (pickedUpAtFormatted && (status === 'picked_up' || status === 'paid_out' || status === 'returned'))
      return { label: 'Recebido em', value: pickedUpAtFormatted, icon: '📦' };
    if (paidAtFormatted && (status === 'paid' || status === 'picked_up' || status === 'paid_out' || status === 'returned'))
      return { label: 'Pago em', value: paidAtFormatted, icon: '💳' };
    if (acceptedAtFormatted && (status === 'accepted' || status === 'paid' || status === 'picked_up'))
      return { label: 'Aceito em', value: acceptedAtFormatted, icon: '✓' };
    if (createdAtFormatted) return { label: 'Criado em', value: createdAtFormatted, icon: '📝' };
    return null;
  }, [returnedAtFormatted, status, pickedUpAtFormatted, paidAtFormatted, acceptedAtFormatted, createdAtFormatted]);

  // If no timestamps, don't render
  if (!statusTimestamp && !paidAtFormatted && !pickedUpAtFormatted && !returnedAtFormatted && !updatedAtFormatted && !pickedUpBy && !asaasPaymentId && !transferGroup && !reviewsOpen) {
    return null;
  }

  return (
    <View style={[styles.container, {
      borderTopColor: colors.border.default,
    }]}>
      {/* Status Timestamp */}
      {statusTimestamp && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            {statusTimestamp.icon}
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            {statusTimestamp.label}: {statusTimestamp.value}
          </ThemedText>
        </View>
      )}

      {/* Paid At - only show if not already shown in status timestamp */}
      {paidAtFormatted && !statusTimestamp?.label.includes('Pago') && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            💳
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Pago em: {paidAtFormatted}
          </ThemedText>
        </View>
      )}

      {/* Picked Up At - only show if not already shown in status timestamp */}
      {pickedUpAtFormatted && !statusTimestamp?.label.includes('Recebido') && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            📦
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Recebido em: {pickedUpAtFormatted}
          </ThemedText>
        </View>
      )}

      {/* Picked Up By */}
      {pickedUpBy && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            👤
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Recebido por: {pickedUpBy.substring(0, 8)}...
          </ThemedText>
        </View>
      )}

      {/* Returned At - only show if not already shown in status timestamp */}
      {returnedAtFormatted && !statusTimestamp?.label.includes('Devolvido') && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            ✅
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Devolvido em: {returnedAtFormatted}
          </ThemedText>
        </View>
      )}

      {/* Reviews Status */}
      {reviewsOpen && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            ⭐
          </ThemedText>
          <View style={{ flex: 1, gap: Spacing['3xs'] }}>
            {viewerRole === 'renter' && reviewsOpen.renterCanReviewOwner && (
              <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Você pode avaliar o dono
              </ThemedText>
            )}
            {viewerRole === 'renter' && reviewsOpen.renterCanReviewItem && (
              <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Você pode avaliar o item
              </ThemedText>
            )}
            {viewerRole === 'owner' && reviewsOpen.ownerCanReviewRenter && (
              <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Você pode avaliar o locatário
              </ThemedText>
            )}
          </View>
        </View>
      )}

      {/* Asaas Payment ID */}
      {asaasPaymentId && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            🔐
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            ID Pagamento: {asaasPaymentId.substring(0, 20)}...
          </ThemedText>
        </View>
      )}

      {/* Transfer Group */}
      {transferGroup && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            🔄
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Grupo Transfer: {transferGroup.substring(0, 12)}...
          </ThemedText>
        </View>
      )}

      {/* Updated At */}
      {updatedAtFormatted && (
        <View style={styles.row}>
          <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
            🕒
          </ThemedText>
          <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.text}>
            Atualizado em: {updatedAtFormatted}
          </ThemedText>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing['3xs'],
    paddingTop: Spacing['3xs'],
    borderTopWidth: 1,
    gap: Spacing['3xs'],
    opacity: 0.8,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xs'],
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

