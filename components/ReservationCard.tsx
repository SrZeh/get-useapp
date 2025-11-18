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
import { ItemCard } from '@/components/features/items/ItemCard';
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
  const { ownerName, item } = useReservationData(r);
  
  const expired = isExpired(r);

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
          flexDirection: 'row',
          width: '100%',
          gap: Spacing.sm,
          padding: Spacing.sm,
        },
        leftSide: {
          flex: 1,
          gap: Spacing.xs,
        },
        headerTitle: {
          fontWeight: '600',
          marginBottom: Spacing['3xs'],
        },
        rightSide: {
          flex: 1,
        },
        itemCardWrapper: {
          position: 'relative',
        },
        loadingItemContainer: {
          width: '100%',
          minHeight: Spacing['3xl'] * 2 + Spacing.md,
          backgroundColor: colors.bg.tertiary,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border.default,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [colors]
  );

  return (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ overflow: 'hidden' }}>
        <View style={styles.container}>
          {/* Left Side: Reservation Info */}
          <View style={styles.leftSide}>
            {/* Header */}
            <View>
              <ThemedText type="title-3" style={styles.headerTitle}>
                Reserva #{r.id.substring(0, 8)}
              </ThemedText>
              {ownerName && (
                <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  👤 Dono: {ownerName}
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

          {/* Right Side: Item Card */}
          <View style={styles.rightSide}>
            {item ? (
              <View style={styles.itemCardWrapper}>
                <ItemCard
                  item={item}
                  width="100%"
                  cardSpacing={0}
                  isMine={false}
                  onPress={() => {
                    HapticFeedback.light();
                    navigation.navigateToItem(item.id);
                  }}
                />
              </View>
            ) : (
              <View style={styles.loadingItemContainer}>
                <ThemedText type="body" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Carregando item...
                </ThemedText>
              </View>
            )}
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

