import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { useThemeColors, formatBRL } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Item } from '@/types';
import { useNavigationService } from '@/providers/ServicesProvider';
import type { BaseCardProps } from '@/components/types';

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

/**
 * ItemCard component - displays an item in a card format
 * 
 * Features:
 * - Responsive image display
 * - Badge rendering (category, condition, min days, location)
 * - Price display with formatting
 * - Conditional styling for owned items
 * - Navigation to item details
 */
export function ItemCard({
  item,
  width,
  onPress,
  isMine = false,
  cardSpacing = 12,
  renderBadges,
}: ItemCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const navigation = useNavigationService();

  const handlePress = () => {
    if (isMine) return;
    if (onPress) {
      onPress();
    } else {
      navigation.navigateToItem(item.id);
    }
  };

  const cardStyle: ViewStyle = {
    width: width ?? '100%',
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
      accessibilityHint={isMine ? 'Este é seu item' : 'Toque para ver detalhes'}
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
          style={{ marginBottom: 12, fontWeight: '600' }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {item.title}
        </ThemedText>

        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {renderBadges ? (
            renderBadges(item)
          ) : (
            <>
              {!!item.category && (
                <View
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 9999,
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
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 9999,
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
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 9999,
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
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 9999,
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
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 9999,
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
          {isMine ? 'Seu item' : 'Ver detalhes'}
        </Button>
      </View>
    </TouchableOpacity>
  );
}

