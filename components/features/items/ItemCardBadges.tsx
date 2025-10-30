/**
 * ItemCardBadges - Badge rendering for ItemCard
 * 
 * Extracted from ItemCard to improve maintainability and allow for better memoization
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { Item } from '@/types';

type ItemCardBadgesProps = {
  item: Item;
};

export const ItemCardBadges = React.memo(function ItemCardBadges({
  item,
}: ItemCardBadgesProps) {
  const colors = useThemeColors();

  return (
    <>
      {!!item.category && (
        <View
          style={{
            paddingVertical: Spacing['3xs'],
            paddingHorizontal: Spacing['2xs'],
            borderRadius: BorderRadius.full,
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <ThemedText
            type="caption-1"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            {item.category}
          </ThemedText>
        </View>
      )}
      {!!item.condition && (
        <View
          style={{
            paddingVertical: Spacing['3xs'],
            paddingHorizontal: Spacing['2xs'],
            borderRadius: BorderRadius.full,
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <ThemedText
            type="caption-1"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            {item.condition}
          </ThemedText>
        </View>
      )}
      {!!item.minRentalDays && (
        <View
          style={{
            paddingVertical: Spacing['3xs'],
            paddingHorizontal: Spacing['2xs'],
            borderRadius: BorderRadius.full,
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <ThemedText
            type="caption-1"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            {item.minRentalDays} dia(s) mínimo
          </ThemedText>
        </View>
      )}
      {!!item.city && (
        <View
          style={{
            paddingVertical: Spacing['3xs'],
            paddingHorizontal: Spacing['2xs'],
            borderRadius: BorderRadius.full,
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <ThemedText
            type="caption-1"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            {item.city}
          </ThemedText>
        </View>
      )}
      {!!item.neighborhood && (
        <View
          style={{
            paddingVertical: Spacing['3xs'],
            paddingHorizontal: Spacing['2xs'],
            borderRadius: BorderRadius.full,
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <ThemedText
            type="caption-1"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            {item.neighborhood}
          </ThemedText>
        </View>
      )}
    </>
  );
}, (prev, next) => {
  // Custom comparison function for optimal memoization
  return (
    prev.item.id === next.item.id &&
    prev.item.category === next.item.category &&
    prev.item.condition === next.item.condition &&
    prev.item.minRentalDays === next.item.minRentalDays &&
    prev.item.city === next.item.city &&
    prev.item.neighborhood === next.item.neighborhood
  );
});

