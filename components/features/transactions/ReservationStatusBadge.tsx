/**
 * ReservationStatusBadge - Status badge with gradient for reservations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { getStatusColors, translateStatus } from '@/utils/reservations';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { ReservationStatus } from '@/types';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ReservationStatusBadgeProps = {
  status: ReservationStatus | string;
  expired: boolean;
  colors: UseThemeColorsReturn;
};

export const ReservationStatusBadge = React.memo(function ReservationStatusBadge({
  status,
  expired,
  colors,
}: ReservationStatusBadgeProps) {
  const displayStatus = expired ? 'expired' : status;
  const statusColors = getStatusColors(status, colors, expired);

  return (
    <View style={styles.container}>
      <LinearGradient colors={statusColors} style={styles.badge}>
        <ThemedText type="caption-1" style={[styles.badgeText, {
          color: colors.isDark ? colors.text.primary : colors.bg.primary,
        }]}>
          {translateStatus(displayStatus)}
        </ThemedText>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingVertical: Spacing['3xs'],
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontWeight: '600',
  },
});

