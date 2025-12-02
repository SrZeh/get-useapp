/**
 * OfferedItemsSection - Displays items offered to help a request
 * 
 * Shows offered items as full ItemCard components in a grid layout
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/utils';
import { Spacing } from '@/constants/spacing';
import type { Item } from '@/types';
import { ItemCard } from './ItemCard';
import { useResponsiveGrid } from '@/hooks/features/items';

type OfferedItemsSectionProps = {
  offeredItemIds: string[];
  offeredItems: Item[];
  /**
   * Layout mode: 'horizontal' for scrollable list, 'grid' for grid layout
   * @default 'grid'
   */
  layout?: 'horizontal' | 'grid';
  /**
   * Card width for horizontal layout (optional)
   */
  cardWidth?: number;
};

export function OfferedItemsSection({
  offeredItemIds,
  offeredItems,
  layout = 'grid',
  cardWidth,
}: OfferedItemsSectionProps) {
  const colors = useThemeColors();
  const grid = useResponsiveGrid(12);

  if (offeredItems.length === 0) {
    return null;
  }

  const effectiveCardWidth = cardWidth || grid.cardWidth;

  return (
    <View style={styles.container}>
      <ThemedText
        type="title-3"
        style={[styles.label, { color: colors.text.primary }]}
      >
        Itens oferecidos ({offeredItems.length})
      </ThemedText>
      <View style={layout === 'grid' ? styles.gridContainer : styles.horizontalContainer}>
        {offeredItems.map((item) => (
          <View
            key={item.id}
            style={[
              layout === 'grid' && {
                width: effectiveCardWidth,
                marginRight: grid.cardSpacing,
                marginBottom: grid.cardSpacing,
              },
            ]}
          >
            <ItemCard
              item={item}
              width={effectiveCardWidth}
              isMine={false}
              cardSpacing={0}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
});

