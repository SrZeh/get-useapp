/**
 * ReservationPrice - Displays price and payment method
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { formatBRL } from '@/utils';
import { formatPaymentMethod } from '@/utils/reservations';
import { Spacing } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ReservationPriceProps = {
  total: number | string;
  isFree: boolean;
  paymentMethodType?: string | null;
  colors: UseThemeColorsReturn;
};

export const ReservationPrice = React.memo(function ReservationPrice({
  total,
  isFree,
  paymentMethodType,
  colors,
}: ReservationPriceProps) {
  const formattedTotal = useMemo(() => {
    const totalValue =
      typeof total === 'number'
        ? total
        : typeof total === 'string'
          ? parseFloat(total)
          : 0;
    return isFree ? 'Grátis' : totalValue > 0 ? formatBRL(totalValue) : 'Não informado';
  }, [total, isFree]);

  const paymentMethod = useMemo(
    () => (paymentMethodType ? formatPaymentMethod(paymentMethodType) : null),
    [paymentMethodType]
  );

  return (
    <View style={styles.container}>
      {/* Price */}
      <View style={[styles.infoRow, { marginTop: Spacing['3xs'] }]}>
        <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
          💰
        </ThemedText>
        <ThemedText type="body" style={[styles.priceText, {
          color: colors.isDark ? colors.brand.primary : colors.brand.dark,
        }]}>
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing['3xs'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xs'],
  },
  priceText: {
    fontWeight: '600',
    flex: 1,
  },
});

