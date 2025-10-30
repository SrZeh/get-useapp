/**
 * ItemCard - Displays an item in a card format
 * 
 * Refactored to use extracted ItemCardBadges component and React.memo for performance
 */

import React, { useCallback } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { useThemeColors, formatBRL } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Item } from '@/types';
import { useNavigationService } from '@/providers/ServicesProvider';
import type { BaseCardProps } from '@/components/types';
import { Spacing } from '@/constants/spacing';
import { ItemCardBadges } from './ItemCardBadges';
import { StarRating } from '@/components/review';

type ItemCardProps = BaseCardProps & {
  /**
   * Item data to display
   */
  item: Item;

  /**
   * Whether this item belongs to the current user
   */
  isMine?: boolean;

  /**
   * Spacing between cards in a grid
   */
  cardSpacing?: number;

  /**
   * Custom badge renderer - allows extending badges without modifying component
   * If provided, replaces default badge rendering
   */
  renderBadges?: (item: Item) => React.ReactNode;
};

export const ItemCard = React.memo(function ItemCard({
  item,
  width,
  onPress,
  isMine = false,
  cardSpacing = Spacing.xs,
  renderBadges,
}: ItemCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const navigation = useNavigationService();

  const handlePress = useCallback(() => {
    if (isMine) return;
    if (onPress) {
      onPress();
    } else {
      navigation.navigateToItem(item.id);
    }
  }, [isMine, onPress, navigation, item.id]);

  const cardStyle: ViewStyle = {
    width: (width ?? '100%') as ViewStyle['width'],
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: cardSpacing,
    backgroundColor: colors.card.bg,
    borderColor: colors.border.default,
    opacity: isMine ? 0.6 : 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const imageHeight = typeof width === 'number' ? width * 0.75 : 200;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isMine}
      activeOpacity={0.7}
      style={cardStyle}
      accessibilityRole="button"
      accessibilityLabel={`Item: ${item.title}`}
      accessibilityHint={isMine ? 'Este é seu item' : 'Toque para alugar'}
    >
      {/* Item Image */}
      {item.photos?.[0] ? (
        <Image
          source={{ uri: item.photos[0] }}
          style={{
            width: '100%',
            height: imageHeight,
            backgroundColor: colors.bg.tertiary,
          }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={item.photos[0]}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: imageHeight,
            backgroundColor: colors.bg.tertiary,
          }}
        />
      )}

      {/* Card Content */}
      <View style={{ width: '100%', padding: 16 }}>
        {/* Title */}
        <ThemedText
          type="title-3"
          numberOfLines={1}
          style={{ marginBottom: 8, fontWeight: '600' }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {item.title}
        </ThemedText>

        {/* Rating */}
        {item.ratingCount !== undefined && item.ratingCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <StarRating value={item.ratingAvg ?? 0} size={14} />
            <ThemedText
              type="caption-1"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              ({item.ratingCount})
            </ThemedText>
          </View>
        ) : null}

        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: Spacing['2xs'], marginBottom: Spacing.xs, flexWrap: 'wrap' }}>
          {renderBadges ? (
            renderBadges(item)
          ) : (
            <ItemCardBadges item={item} />
          )}
        </View>

        {/* Price */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <ThemedText
            type="title-2"
            style={{ fontWeight: '700' }}
            lightColor="#08af0e"
            darkColor="#96ff9a"
          >
            {formatBRL(item.dailyRate)}
          </ThemedText>
          <ThemedText
            type="footnote"
            className="text-light-text-tertiary dark:text-dark-text-tertiary"
          >
            / dia
          </ThemedText>
        </View>

        {/* Description */}
        {!!item.description && (
          <ThemedText
            type="footnote"
            numberOfLines={2}
            style={{ marginBottom: 12 }}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {item.description}
          </ThemedText>
        )}

        {/* Action Button */}
        <Button
          variant="primary"
          onPress={handlePress}
          disabled={isMine}
          style={{
            alignSelf: 'flex-start',
            opacity: isMine ? 0.5 : 1,
          }}
        >
          {isMine ? 'Seu item' : 'Alugue já'}
        </Button>
      </View>
    </TouchableOpacity>
  );
}, (prev, next) => {
  // Custom comparison function for optimal memoization
  // Only re-render if item data or relevant props change
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.dailyRate === next.item.dailyRate &&
    prev.item.photos?.[0] === next.item.photos?.[0] &&
    prev.item.description === next.item.description &&
    prev.item.category === next.item.category &&
    prev.item.condition === next.item.condition &&
    prev.item.minRentalDays === next.item.minRentalDays &&
    prev.item.city === next.item.city &&
    prev.item.neighborhood === next.item.neighborhood &&
    prev.item.ratingAvg === next.item.ratingAvg &&
    prev.item.ratingCount === next.item.ratingCount &&
    prev.isMine === next.isMine &&
    prev.width === next.width &&
    prev.cardSpacing === next.cardSpacing &&
    prev.renderBadges === next.renderBadges &&
    prev.onPress === next.onPress
  );
});

