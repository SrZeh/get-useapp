/**
 * ReservationDates - Displays check-in and check-out dates
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { formatISODate } from '@/utils/reservations';
import { Spacing } from '@/constants/spacing';

type ReservationDatesProps = {
  startDate: string;
  endDate: string;
  days?: number;
};

export const ReservationDates = React.memo(function ReservationDates({
  startDate,
  endDate,
  days,
}: ReservationDatesProps) {
  const formattedStartDate = useMemo(() => formatISODate(startDate), [startDate]);
  const formattedEndDate = useMemo(() => formatISODate(endDate), [endDate]);
  const daysLabel = useMemo(
    () => (days ? `${days} ${days === 1 ? 'dia' : 'dias'}` : 'Duração não informada'),
    [days]
  );

  return (
    <View style={styles.container}>
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
      
      {/* Duration */}
      <View style={styles.infoRow}>
        <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
          ⏱️
        </ThemedText>
        <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
          {daysLabel}
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing['3xs'],
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xs'],
    justifyContent: 'center',
  },
  dateContent: {
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3xs'],
    justifyContent: 'center',
  },
});

