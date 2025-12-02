/**
 * ItemCard - Displays an item in a card format
 * 
 * Refactored to use extracted ItemCardBadges component and React.memo for performance
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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
import { router } from 'expo-router';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';

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

  /**
   * Minimal mode - shows only photo, title, price, and button
   * Useful for consistent card heights in horizontal scrolls
   */
  minimal?: boolean;
};

export const ItemCard = React.memo(function ItemCard({
  item,
  width,
  onPress,
  isMine = false,
  cardSpacing = Spacing.xs,
  renderBadges,
  minimal = false,
}: ItemCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const navigation = useNavigationService();
  const [currentItem, setCurrentItem] = useState<Item>(item);
  const isRequest = currentItem.itemType === 'request';

  // Subscribe to real-time updates for request items
  useEffect(() => {
    if (!isRequest) {
      setCurrentItem(item);
      return;
    }

    console.log('[ItemCard] Setting up listener for request item:', item.id);

    const itemRef = doc(db, FIRESTORE_COLLECTIONS.ITEMS, item.id);
    const unsubscribe = onSnapshot(itemRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<Item>;
        const updatedItem: Item = {
          id: snapshot.id,
          title: data.title ?? '(sem título)',
          description: data.description ?? '',
          photos: data.photos ?? [],
          available: data.available ?? true,
          createdAt: data.createdAt ?? null,
          ratingCount: data.ratingCount ?? 0,
          ratingSum: data.ratingSum ?? 0,
          ownerRatingCount: data.ownerRatingCount ?? 0,
          ownerRatingSum: data.ownerRatingSum ?? 0,
          ...data,
        } as Item;
        
        setCurrentItem(updatedItem);
      }
    }, (error) => {
      console.error('[ItemCard] Error listening to item updates:', error);
    });

    return () => {
      console.log('[ItemCard] Cleaning up listener for item:', item.id);
      unsubscribe();
    };
  }, [isRequest, item.id]);

  const handlePress = useCallback(() => {
    if (isMine) return;
    if (onPress) {
      onPress();
    } else {
      navigation.navigateToItem(currentItem.id);
    }
  }, [isMine, onPress, navigation, currentItem.id]);

  const handleOfferHelp = useCallback(() => {
    if (isRequest && !isMine) {
      router.push(`/item/${currentItem.id}/offer-help`);
    }
  }, [isRequest, isMine, currentItem.id]);

  // Red border for help requests (socorro)
  const requestBorderColor = isRequest 
    ? colors.semantic.error
    : colors.border.default;

  const cardStyle: ViewStyle = {
    width: (width ?? '100%') as ViewStyle['width'],
    borderRadius: 16,
    borderWidth: isRequest ? 2 : 1,
    overflow: 'hidden' as const,
    marginBottom: cardSpacing,
    backgroundColor: colors.card.bg,
    borderColor: requestBorderColor,
    opacity: isMine ? 0.6 : 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative' as const,
  };

  const imageHeight = typeof width === 'number' ? width * 0.75 : 200;

  // Don't wrap in TouchableOpacity if isMine (buttons are outside)
  if (isMine) {
    return (
      <View style={cardStyle}>
        {/* Warning triangle for help requests - only show if not mine */}
        {isRequest && !isMine && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderTopWidth: 0,
              borderRightWidth: 50,
              borderBottomWidth: 50,
              borderLeftWidth: 0,
              borderTopColor: 'transparent',
              borderRightColor: requestBorderColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              zIndex: 10,
            }}
          >
            <Ionicons
              name="alert"
              size={20}
              color="#ffffff"
              style={{
                position: 'absolute',
                top: 10,
                right: -35,
              }}
            />
          </View>
        )}
      {/* Item Image */}
      {!isRequest && currentItem.photos?.[0] ? (
        <Image
          source={{ uri: currentItem.photos[0] }}
          style={{
            width: '100%',
            height: imageHeight,
            backgroundColor: colors.bg.tertiary,
          }}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={currentItem.photos[0]}
        />
      ) : null}

      {/* Card Content */}
      <View style={{ width: '100%', padding: 16 }}>
        {/* Title */}
        <ThemedText
          type="title-3"
          numberOfLines={1}
          style={{ marginBottom: 8, fontWeight: '600' }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {currentItem.title}
        </ThemedText>

        {/* Rating - displayed under item name - hidden in minimal mode */}
        {!minimal && currentItem.ratingCount !== undefined && currentItem.ratingCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <StarRating value={currentItem.ratingAvg ?? 0} size={14} />
            <ThemedText
              type="caption-1"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              ({currentItem.ratingCount})
            </ThemedText>
          </View>
        ) : null}

        {/* Badges - hidden in minimal mode */}
        {!minimal && (
          <View style={{ flexDirection: 'row', gap: Spacing['2xs'], marginBottom: Spacing.xs, flexWrap: 'wrap' }}>
            {renderBadges ? (
              renderBadges(currentItem)
            ) : (
              <ItemCardBadges item={currentItem} />
            )}
          </View>
        )}

        {/* Price - Show for non-request items (including free items with dailyRate === 0) */}
        {!isRequest && typeof currentItem.dailyRate === 'number' && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <ThemedText
              type="title-2"
              style={{ fontWeight: '700' }}
              lightColor="#08af0e"
              darkColor="#96ff9a"
            >
              {formatBRL(currentItem.dailyRate)}
            </ThemedText>
            <ThemedText
              type="footnote"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              / dia
            </ThemedText>
          </View>
        )}

        {/* Description - hidden in minimal mode */}
        {!minimal && !!currentItem.description && (
          <ThemedText
            type="footnote"
            numberOfLines={2}
            style={{ marginBottom: 12 }}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {currentItem.description}
          </ThemedText>
        )}

        {/* Action Button */}
        <Button
          variant="primary"
          onPress={isRequest && !isMine ? handleOfferHelp : handlePress}
          disabled={isMine}
          style={{
            alignSelf: 'flex-start',
            opacity: isMine ? 0.5 : 1,
          }}
        >
          {isMine 
            ? (currentItem.itemType === 'request' ? 'Seu pedido' : 'Seu item')
            : (currentItem.itemType === 'request' ? 'Oferecer ajuda' : 'Alugue já')
          }
        </Button>
      </View>
    </View>
    );
  }

  // For request items that are not mine, don't make the whole card clickable
  // Only the button should be clickable
  if (isRequest && !isMine) {
    return (
      <View style={cardStyle}>
        {/* Warning triangle for help requests */}
        {isRequest && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderTopWidth: 0,
              borderRightWidth: 50,
              borderBottomWidth: 50,
              borderLeftWidth: 0,
              borderTopColor: 'transparent',
              borderRightColor: requestBorderColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              zIndex: 10,
            }}
          >
            <Ionicons
              name="alert"
              size={20}
              color="#ffffff"
              style={{
                position: 'absolute',
                top: 10,
                right: -35,
              }}
            />
          </View>
        )}
      {/* Item Image */}
      {!isRequest && currentItem.photos?.[0] ? (
        <Image
          source={{ uri: currentItem.photos[0] }}
          style={{
            width: '100%',
            height: imageHeight,
            backgroundColor: colors.bg.tertiary,
          }}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={currentItem.photos[0]}
        />
      ) : null}

      {/* Card Content */}
      <View style={{ width: '100%', padding: 16 }}>
        {/* Title */}
        <ThemedText
          type="title-3"
          numberOfLines={1}
          style={{ marginBottom: 8, fontWeight: '600' }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {currentItem.title}
        </ThemedText>

        {/* Rating - displayed under item name - hidden in minimal mode */}
        {!minimal && currentItem.ratingCount !== undefined && currentItem.ratingCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <StarRating value={currentItem.ratingAvg ?? 0} size={14} />
            <ThemedText
              type="caption-1"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              ({currentItem.ratingCount})
            </ThemedText>
          </View>
        ) : null}

        {/* Badges - hidden in minimal mode */}
        {!minimal && (
          <View style={{ flexDirection: 'row', gap: Spacing['2xs'], marginBottom: Spacing.xs, flexWrap: 'wrap' }}>
            {renderBadges ? (
              renderBadges(currentItem)
            ) : (
              <ItemCardBadges item={currentItem} />
            )}
          </View>
        )}

        {/* Price - Show for non-request items (including free items with dailyRate === 0) */}
        {!isRequest && typeof currentItem.dailyRate === 'number' && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <ThemedText
              type="title-2"
              style={{ fontWeight: '700' }}
              lightColor="#08af0e"
              darkColor="#96ff9a"
            >
              {formatBRL(currentItem.dailyRate)}
            </ThemedText>
            <ThemedText
              type="footnote"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              / dia
            </ThemedText>
          </View>
        )}

        {/* Description - hidden in minimal mode */}
        {!minimal && !!currentItem.description && (
          <ThemedText
            type="footnote"
            numberOfLines={2}
            style={{ marginBottom: 12 }}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {currentItem.description}
          </ThemedText>
        )}

        {/* Action Button */}
        <Button
          variant="primary"
          onPress={handleOfferHelp}
          disabled={isMine}
          style={{
            alignSelf: 'flex-start',
            opacity: isMine ? 0.5 : 1,
          }}
        >
          Oferecer ajuda
        </Button>
      </View>
    </View>
  );
  }

  // Default case: regular items (not requests or not mine)
  // In minimal mode, don't make the whole card clickable (only the button) to avoid nested buttons on web
  if (minimal) {
    return (
      <View style={cardStyle}>
        {/* Warning triangle for help requests - only show for requests */}
        {isRequest && !isMine && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderTopWidth: 0,
              borderRightWidth: 50,
              borderBottomWidth: 50,
              borderLeftWidth: 0,
              borderTopColor: 'transparent',
              borderRightColor: requestBorderColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              zIndex: 10,
            }}
          >
            <Ionicons
              name="alert"
              size={20}
              color="#ffffff"
              style={{
                position: 'absolute',
                top: 8,
                right: -30,
              }}
            />
          </View>
        )}
        {/* Item Image */}
        {!isRequest && currentItem.photos?.[0] ? (
          <Image
            source={{ uri: currentItem.photos[0] }}
            style={{
              width: '100%',
              height: imageHeight,
              backgroundColor: colors.bg.tertiary,
            }}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={currentItem.photos[0]}
          />
        ) : null}

        {/* Card Content */}
        <View style={{ width: '100%', padding: 16 }}>
          {/* Title */}
          <ThemedText
            type="title-3"
            numberOfLines={1}
            style={{ marginBottom: 8, fontWeight: '600' }}
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            {currentItem.title}
          </ThemedText>

          {/* Price - Show for non-request items (including free items with dailyRate === 0) */}
          {!isRequest && typeof currentItem.dailyRate === 'number' && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <ThemedText
                type="title-2"
                style={{ fontWeight: '700' }}
                lightColor="#08af0e"
                darkColor="#96ff9a"
              >
                {formatBRL(currentItem.dailyRate)}
              </ThemedText>
              <ThemedText
                type="footnote"
                className="text-light-text-tertiary dark:text-dark-text-tertiary"
              >
                / dia
              </ThemedText>
            </View>
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
            {isMine 
              ? (currentItem.itemType === 'request' ? 'Seu pedido' : 'Seu item')
              : (currentItem.itemType === 'request' ? 'Oferecer ajuda' : 'Alugue já')
            }
          </Button>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isMine}
      activeOpacity={0.7}
      style={cardStyle}
      accessibilityRole="button"
      accessibilityLabel={`Item: ${currentItem.title}`}
      accessibilityHint={isMine ? 'Este é seu item' : 'Toque para alugar'}
    >
      {/* Warning triangle for help requests - only show for requests */}
      {isRequest && !isMine && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderTopWidth: 0,
            borderRightWidth: 50,
            borderBottomWidth: 50,
            borderLeftWidth: 0,
            borderTopColor: 'transparent',
            borderRightColor: requestBorderColor,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            zIndex: 10,
          }}
        >
          <Ionicons
            name="alert"
            size={20}
            color="#ffffff"
            style={{
              position: 'absolute',
              top: 8,
              right: -30,
            }}
          />
        </View>
      )}
      {/* Item Image */}
      {!isRequest && currentItem.photos?.[0] ? (
        <Image
          source={{ uri: currentItem.photos[0] }}
          style={{
            width: '100%',
            height: imageHeight,
            backgroundColor: colors.bg.tertiary,
          }}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={currentItem.photos[0]}
        />
      ) : null}

      {/* Card Content */}
      <View style={{ width: '100%', padding: 16 }}>
        {/* Title */}
        <ThemedText
          type="title-3"
          numberOfLines={1}
          style={{ marginBottom: 8, fontWeight: '600' }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {currentItem.title}
        </ThemedText>

        {/* Rating - displayed under item name - hidden in minimal mode */}
        {!minimal && currentItem.ratingCount !== undefined && currentItem.ratingCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <StarRating value={currentItem.ratingAvg ?? 0} size={14} />
            <ThemedText
              type="caption-1"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              ({currentItem.ratingCount})
            </ThemedText>
          </View>
        ) : null}

        {/* Badges - hidden in minimal mode */}
        {!minimal && (
          <View style={{ flexDirection: 'row', gap: Spacing['2xs'], marginBottom: Spacing.xs, flexWrap: 'wrap' }}>
            {renderBadges ? (
              renderBadges(currentItem)
            ) : (
              <ItemCardBadges item={currentItem} />
            )}
          </View>
        )}

        {/* Price - Show for non-request items (including free items with dailyRate === 0) */}
        {!isRequest && typeof currentItem.dailyRate === 'number' && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <ThemedText
              type="title-2"
              style={{ fontWeight: '700' }}
              lightColor="#08af0e"
              darkColor="#96ff9a"
            >
              {formatBRL(currentItem.dailyRate)}
            </ThemedText>
            <ThemedText
              type="footnote"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              / dia
            </ThemedText>
          </View>
        )}

        {/* Description - hidden in minimal mode */}
        {!minimal && !!currentItem.description && (
          <ThemedText
            type="footnote"
            numberOfLines={2}
            style={{ marginBottom: 12 }}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {currentItem.description}
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
          {isMine 
            ? (currentItem.itemType === 'request' ? 'Seu pedido' : 'Seu item')
            : (currentItem.itemType === 'request' ? 'Oferecer ajuda' : 'Alugue já')
          }
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
    prev.item.itemType === next.item.itemType &&
    prev.item.updatedAt === next.item.updatedAt &&
    prev.isMine === next.isMine &&
    prev.width === next.width &&
    prev.cardSpacing === next.cardSpacing &&
    prev.renderBadges === next.renderBadges &&
    prev.minimal === next.minimal &&
    prev.onPress === next.onPress
  );
});

