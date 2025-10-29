/**
 * ReservationCard - Displays a reservation with status, dates, and actions
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { AnimatedCard } from '@/components/AnimatedCard';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { HapticFeedback, useThemeColors, formatBRL } from '@/utils';
import type { Reservation } from '@/types';
import type { BaseCardProps } from '@/components/types';
import { useNavigationService } from '@/providers/ServicesProvider';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { ItemCard } from '@/components/items/ItemCard';
import { useReservationData } from '@/hooks/useReservationData';
import {
  isExpired,
  getStatusColors,
  formatISODate,
  formatTimestamp,
  formatPaymentMethod,
  translateStatus,
} from '@/utils/reservations';
import type { FirestoreTimestamp } from '@/types/firestore';

type ReservationCardProps = BaseCardProps & {
  /**
   * Reservation data to display
   */
  reservation: Reservation;

  /**
   * Custom actions to render in the card
   */
  actions?: React.ReactNode;
};

export const ReservationCard = React.memo(function ReservationCard({
  reservation: r,
  actions,
}: ReservationCardProps) {
  const colors = useThemeColors();
  const navigation = useNavigationService();
  const { ownerName, item } = useReservationData(r);
  
  const expired = isExpired(r);
  const displayStatus = expired ? 'expired' : r.status;
  
  const daysLabel = useMemo(
    () => (r.days ? `${r.days} ${r.days === 1 ? 'dia' : 'dias'}` : 'Duração não informada'),
    [r.days]
  );

  const statusColors = useMemo(() => getStatusColors(r.status, colors, expired), [r.status, colors, expired]);

  // Format dates
  const formattedStartDate = useMemo(() => formatISODate(r.startDate), [r.startDate]);
  const formattedEndDate = useMemo(() => formatISODate(r.endDate), [r.endDate]);

  // Format total price
  const formattedTotal = useMemo(() => {
    const totalValue =
      typeof r.total === 'number'
        ? r.total
        : typeof r.total === 'string'
          ? parseFloat(r.total)
          : 0;
    return r.isFree ? 'Grátis' : totalValue > 0 ? formatBRL(totalValue) : 'Não informado';
  }, [r.total, r.isFree]);

  // Payment method
  const paymentMethod = useMemo(
    () => (r.paymentMethodType ? formatPaymentMethod(r.paymentMethodType) : null),
    [r.paymentMethodType]
  );

  // Timestamps
  const paidAtFormatted = useMemo(() => formatTimestamp(r.paidAt), [r.paidAt]);
  const acceptedAtFormatted = useMemo(() => formatTimestamp(r.acceptedAt), [r.acceptedAt]);
  const pickedUpAtFormatted = useMemo(() => formatTimestamp(r.pickedUpAt), [r.pickedUpAt]);
  const returnedAtFormatted = useMemo(() => formatTimestamp(r.returnedAt), [r.returnedAt]);
  const createdAtFormatted = useMemo(() => formatTimestamp(r.createdAt), [r.createdAt]);
  
  // Additional fields (accessed dynamically as they might not be in type)
  const reservation = r as unknown as Record<string, unknown>;
  const updatedAtFormatted = useMemo(
    () => formatTimestamp(reservation.updatedAt as FirestoreTimestamp),
    [reservation.updatedAt]
  );
  const pickedUpBy = reservation.pickedUpBy as string | undefined;
  const stripePaymentIntentId = reservation.stripePaymentIntentId as string | undefined;
  const transferGroup = reservation.transferGroup as string | undefined;
  const reviewsOpen = reservation.reviewsOpen as {
    renterCanReviewOwner?: boolean;
    ownerCanReviewItem?: boolean;
    renterCanReviewItem?: boolean;
  } | undefined;

  // Status-specific timestamp to show
  const statusTimestamp = useMemo(() => {
    if (returnedAtFormatted && r.status === 'returned')
      return { label: 'Devolvido em', value: returnedAtFormatted, icon: '✅' };
    if (pickedUpAtFormatted && (r.status === 'picked_up' || r.status === 'paid_out' || r.status === 'returned'))
      return { label: 'Recebido em', value: pickedUpAtFormatted, icon: '📦' };
    if (paidAtFormatted && (r.status === 'paid' || r.status === 'picked_up' || r.status === 'paid_out' || r.status === 'returned'))
      return { label: 'Pago em', value: paidAtFormatted, icon: '💳' };
    if (acceptedAtFormatted && (r.status === 'accepted' || r.status === 'paid' || r.status === 'picked_up'))
      return { label: 'Aceito em', value: acceptedAtFormatted, icon: '✓' };
    if (createdAtFormatted) return { label: 'Criado em', value: createdAtFormatted, icon: '📝' };
    return null;
  }, [returnedAtFormatted, r.status, pickedUpAtFormatted, paidAtFormatted, acceptedAtFormatted, createdAtFormatted]);

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
        statusBadgeContainer: {
          alignSelf: 'flex-start',
          marginBottom: Spacing.xs,
        },
        statusBadge: {
          paddingVertical: Spacing['3xs'],
          paddingHorizontal: Spacing.xs,
          borderRadius: BorderRadius.md,
        },
        statusBadgeText: {
          color: colors.isDark ? colors.text.primary : colors.bg.primary,
          fontWeight: '600',
        },
        datesContainer: {
          gap: Spacing['3xs'],
        },
        dateRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing['3xs'],
        },
        dateContent: {
          flex: 1,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing['3xs'],
        },
        priceText: {
          fontWeight: '600',
          color: colors.isDark ? colors.brand.primary : colors.brand.dark,
          flex: 1,
        },
        timestampsSection: {
          marginTop: Spacing['3xs'],
          paddingTop: Spacing['3xs'],
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          gap: Spacing['3xs'],
          opacity: 0.8,
        },
        timestampRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing['3xs'],
        },
        timestampText: {
          flex: 1,
        },
        actionsSection: {
          marginTop: Spacing.xs,
          gap: Spacing.xs,
        },
        actionButton: {
          alignSelf: 'flex-start',
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
            <View style={styles.statusBadgeContainer}>
              <LinearGradient colors={statusColors} style={styles.statusBadge}>
                <ThemedText type="caption-1" style={styles.statusBadgeText}>
                  {translateStatus(displayStatus)}
                </ThemedText>
              </LinearGradient>
            </View>

            {/* Dates with Check-in/Check-out labels */}
            <View style={styles.datesContainer}>
              <View style={styles.dateRow}>
                <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                  📅
                </ThemedText>
                <View style={styles.dateContent}>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    Check-in:{' '}
                  </ThemedText>
                  <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                    {formattedStartDate}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.dateRow}>
                <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                  🏁
                </ThemedText>
                <View style={styles.dateContent}>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    Check-out:{' '}
                  </ThemedText>
                  <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                    {formattedEndDate}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.infoRow}>
              <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                ⏱️
              </ThemedText>
              <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                {daysLabel}
              </ThemedText>
            </View>

            {/* Price */}
            <View style={[styles.infoRow, { marginTop: Spacing['3xs'] }]}>
              <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                💰
              </ThemedText>
              <ThemedText type="body" style={styles.priceText}>
                {formattedTotal}
              </ThemedText>
            </View>

            {/* Payment Method */}
            {paymentMethod && (
              <View style={styles.infoRow}>
                <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                  💳
                </ThemedText>
                <ThemedText type="caption-1" className="text-light-text-secondary dark:text-dark-text-secondary">
                  Pagamento: {paymentMethod}
                </ThemedText>
              </View>
            )}

            {/* All Timestamps Section */}
            <View style={styles.timestampsSection}>
              {/* Status Timestamp */}
              {statusTimestamp && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    {statusTimestamp.icon}
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    {statusTimestamp.label}: {statusTimestamp.value}
                  </ThemedText>
                </View>
              )}

              {/* Paid At - only show if not already shown in status timestamp */}
              {paidAtFormatted && !statusTimestamp?.label.includes('Pago') && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    💳
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Pago em: {paidAtFormatted}
                  </ThemedText>
                </View>
              )}

              {/* Picked Up At - only show if not already shown in status timestamp */}
              {pickedUpAtFormatted && !statusTimestamp?.label.includes('Recebido') && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    📦
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Recebido em: {pickedUpAtFormatted}
                  </ThemedText>
                </View>
              )}

              {/* Picked Up By */}
              {pickedUpBy && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    👤
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Recebido por: {pickedUpBy.substring(0, 8)}...
                  </ThemedText>
                </View>
              )}

              {/* Returned At - only show if not already shown in status timestamp */}
              {returnedAtFormatted && !statusTimestamp?.label.includes('Devolvido') && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    ✅
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Devolvido em: {returnedAtFormatted}
                  </ThemedText>
                </View>
              )}

              {/* Reviews Status */}
              {reviewsOpen && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    ⭐
                  </ThemedText>
                  <View style={{ flex: 1, gap: Spacing['3xs'] }}>
                    {reviewsOpen.renterCanReviewOwner && (
                      <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        Você pode avaliar o dono
                      </ThemedText>
                    )}
                    {reviewsOpen.renterCanReviewItem && (
                      <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        Você pode avaliar o item
                      </ThemedText>
                    )}
                    {reviewsOpen.ownerCanReviewItem && (
                      <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        Você pode avaliar o item
                      </ThemedText>
                    )}
                  </View>
                </View>
              )}

              {/* Stripe Payment Intent ID */}
              {stripePaymentIntentId && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    🔐
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    ID Pagamento: {stripePaymentIntentId.substring(0, 20)}...
                  </ThemedText>
                </View>
              )}

              {/* Transfer Group */}
              {transferGroup && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    🔄
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Grupo Transfer: {transferGroup.substring(0, 12)}...
                  </ThemedText>
                </View>
              )}

              {/* Updated At */}
              {updatedAtFormatted && (
                <View style={styles.timestampRow}>
                  <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
                    🕒
                  </ThemedText>
                  <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={styles.timestampText}>
                    Atualizado em: {updatedAtFormatted}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Actions Section */}
            {actions && (
              <View style={styles.actionsSection}>
                <Button
                  variant="ghost"
                  onPress={() => {
                    HapticFeedback.light();
                    navigation.navigateToTransactionChat(r.id);
                  }}
                  style={styles.actionButton}
                  textStyle={{ color: colors.semantic.info } as any}
                >
                  💬 Mensagens
                </Button>
                {actions}
              </View>
            )}
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
    prevProps.actions === nextProps.actions
  );
});

