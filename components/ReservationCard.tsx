/**
 * ReservationCard - Displays a reservation with status, dates, and actions
 * 
 * Refactored to use extracted sub-components:
 * - ReservationStatusBadge: Status badge with gradient
 * - ReservationDates: Check-in/check-out dates
 * - ReservationPrice: Price and payment method
 * - ReservationTimestamps: All timestamp information
 * - ReservationActions: Action buttons wrapper
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AnimatedCard } from '@/components/AnimatedCard';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils';
import type { Reservation } from '@/types';
import type { BaseCardProps } from '@/components/types';
import { useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useReservationData } from '@/hooks/features/reservations';
import { isExpired } from '@/utils/reservations';
import { ReservationStatusBadge } from '@/components/features/transactions/ReservationStatusBadge';
import { ReservationDates } from '@/components/features/transactions/ReservationDates';
import { ReservationPrice } from '@/components/features/transactions/ReservationPrice';
import { ReservationTimestamps } from '@/components/features/transactions/ReservationTimestamps';
import { ReservationActions } from '@/components/features/transactions/ReservationActions';
import type { FirestoreTimestamp } from '@/types/firestore';

type ReservationCardProps = BaseCardProps & {
  /**
   * Reservation data to display
   */
  reservation: Reservation;

  /**
   * Perspective of the current viewer
   */
  viewerRole?: 'owner' | 'renter';

  /**
   * Custom actions to render in the card
   */
  actions?: React.ReactNode;
};

export const ReservationCard = React.memo(function ReservationCard({
  reservation: r,
  viewerRole = 'renter',
  actions,
}: ReservationCardProps) {
  const colors = useThemeColors();
  const navigation = useNavigationService();
  const { ownerName, renterName, item } = useReservationData(r);
  
  const expired = isExpired(r);

  // Show renter name when viewing as owner, owner name when viewing as renter
  const displayName = viewerRole === 'owner' ? renterName : ownerName;
  const displayLabel = viewerRole === 'owner' ? 'Solicitante' : 'Dono';

  // Additional fields (accessed dynamically as they might not be in type)
  const reservation = r as unknown as Record<string, unknown>;
  const pickedUpBy = reservation.pickedUpBy as string | undefined;
  const stripePaymentIntentId = reservation.stripePaymentIntentId as string | undefined;
  const transferGroup = reservation.transferGroup as string | undefined;
  const reviewsOpen = reservation.reviewsOpen as {
    renterCanReviewOwner?: boolean;
    renterCanReviewItem?: boolean;
    ownerCanReviewRenter?: boolean;
  } | undefined;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          padding: Spacing.sm,
        },
        content: {
          gap: Spacing.xs,
          alignItems: 'center',
        },
        header: {
          alignItems: 'center',
          marginBottom: Spacing.xs,
        },
        headerTitle: {
          fontWeight: '600',
          marginBottom: Spacing['3xs'],
          textAlign: 'center',
        },
        ownerName: {
          textAlign: 'center',
        },
      }),
    []
  );

  return (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ overflow: 'hidden' }}>
        <View style={styles.container}>
          {/* Reservation Info */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title-3" style={styles.headerTitle}>
                {item?.title ?? 'Carregando item...'}
              </ThemedText>
              {displayName && (
                <ThemedText type="caption-1" style={styles.ownerName} className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  👤 {displayLabel}: {displayName}
                </ThemedText>
              )}
            </View>

            {/* Status Badge */}
            <ReservationStatusBadge
              status={r.status}
              expired={expired}
              colors={colors}
            />

            {/* Dates with Check-in/Check-out labels */}
            <ReservationDates
              startDate={r.startDate}
              endDate={r.endDate}
              days={r.days}
            />

            {/* Price */}
            <ReservationPrice
              total={r.total}
              isFree={r.isFree}
              paymentMethodType={r.paymentMethodType}
              colors={colors}
            />

            {/* All Timestamps Section */}
            <ReservationTimestamps
              status={r.status}
              paidAt={r.paidAt}
              acceptedAt={r.acceptedAt}
              pickedUpAt={r.pickedUpAt}
              returnedAt={r.returnedAt}
              createdAt={r.createdAt}
              updatedAt={reservation.updatedAt as FirestoreTimestamp}
              pickedUpBy={pickedUpBy}
              stripePaymentIntentId={stripePaymentIntentId}
              transferGroup={transferGroup}
              reviewsOpen={reviewsOpen}
              viewerRole={viewerRole}
              colors={colors}
            />

            {/* Actions Section */}
            <ReservationActions
              reservationId={r.id}
              onNavigateToChat={navigation.navigateToTransactionChat}
              actions={actions}
              colors={colors}
            />
          </View>
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  const prevRes = prevProps.reservation as unknown as Record<string, unknown>;
  const nextRes = nextProps.reservation as unknown as Record<string, unknown>;
  
  return (
    prevProps.reservation.id === nextProps.reservation.id &&
    prevProps.reservation.status === nextProps.reservation.status &&
    prevProps.reservation.startDate === nextProps.reservation.startDate &&
    prevProps.reservation.endDate === nextProps.reservation.endDate &&
    prevProps.reservation.days === nextProps.reservation.days &&
    prevProps.reservation.total === nextProps.reservation.total &&
    prevProps.reservation.itemTitle === nextProps.reservation.itemTitle &&
    prevProps.reservation.paymentMethodType === nextProps.reservation.paymentMethodType &&
    prevProps.reservation.paidAt === nextProps.reservation.paidAt &&
    prevProps.reservation.acceptedAt === nextProps.reservation.acceptedAt &&
    prevProps.reservation.pickedUpAt === nextProps.reservation.pickedUpAt &&
    prevProps.reservation.returnedAt === nextProps.reservation.returnedAt &&
    prevProps.reservation.isFree === nextProps.reservation.isFree &&
    prevRes.pickedUpBy === nextRes.pickedUpBy &&
    prevRes.stripePaymentIntentId === nextRes.stripePaymentIntentId &&
    prevRes.transferGroup === nextRes.transferGroup &&
    prevRes.reviewsOpen === nextRes.reviewsOpen &&
    prevRes.updatedAt === nextRes.updatedAt &&
    prevProps.reservation.itemOwnerUid === nextProps.reservation.itemOwnerUid &&
    prevProps.actions === nextProps.actions &&
    prevProps.viewerRole === nextProps.viewerRole
  );
});

