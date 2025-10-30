/**
 * ProfileStats - Displays user statistics (rating, reviews count, transactions)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';
import type { UserProfile } from '@/types';

type ProfileStatsProps = {
  user: UserProfile | null;
  colors: UseThemeColorsReturn;
  borderOpacity: { default: string };
};

export const ProfileStats = React.memo(function ProfileStats({
  user,
  colors,
  borderOpacity,
}: ProfileStatsProps) {
  return (
    <View style={[styles.container, {
      borderTopColor: borderOpacity.default,
    }]}>
      <View style={styles.stat}>
        <ThemedText type="title-2" style={[styles.statValue, {
          color: colors.isDark ? colors.brand.primary : colors.brand.dark,
        }]}>
          {(user?.ratingAvg ?? 5).toFixed(1)}
        </ThemedText>
        <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
          ⭐ Avaliação
        </ThemedText>
      </View>
      <View style={styles.stat}>
        <ThemedText type="title-2" style={[styles.statValue, {
          color: colors.isDark ? colors.brand.primary : colors.brand.dark,
        }]}>
          {user?.ratingCount ?? 0}
        </ThemedText>
        <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
          Avaliações
        </ThemedText>
      </View>
      <View style={styles.stat}>
        <ThemedText type="title-2" style={[styles.statValue, {
          color: colors.isDark ? colors.brand.primary : colors.brand.dark,
        }]}>
          {user?.transactionsTotal ?? 0}
        </ThemedText>
        <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
          Transações
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
});

