import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { StarRating } from '@/components/review';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Item } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type ItemHeaderProps = {
  item: Item;
};

/**
 * ItemHeader component - displays item details header section
 * 
 * Features:
 * - Item image display with improved size and visual appeal
 * - Enhanced typography hierarchy with better spacing
 * - Refined color usage following design system
 * - Location information
 * - Description
 */
export function ItemHeader({ item }: ItemHeaderProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Improved image height: 360px for better visual impact (was 280px)
  const IMAGE_HEIGHT = 360;

  return (
    <LiquidGlassView 
      intensity="standard" 
      cornerRadius={24} 
      style={styles.container}
    >
      {item.photos?.[0] && (
        <ExpoImage
          source={{ uri: item.photos[0] }}
          style={[styles.image, { height: IMAGE_HEIGHT }]}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          recyclingKey={item.photos[0]}
          placeholderContentFit="cover"
        />
      )}
      <View style={styles.content}>
        {/* Title with enhanced typography */}
        <ThemedText 
          type="title-1" 
          style={[styles.title, { color: palette.text }]}
          lightColor={Colors.light.text}
          darkColor={Colors.dark.text}
        >
          {item.title}
        </ThemedText>

        {/* Rating section with improved spacing */}
        <View style={styles.ratingContainer}>
          <StarRating value={item.ratingAvg ?? 0} />
          {!!item.ratingCount && (
            <ThemedText 
              type="callout" 
              style={styles.ratingText}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              ({item.ratingCount} {item.ratingCount === 1 ? 'avaliação' : 'avaliações'})
            </ThemedText>
          )}
        </View>

        {/* Category badge with better visual treatment */}
        {!!item.category && (
          <View style={styles.categoryContainer}>
            <ThemedText 
              type="footnote" 
              style={[styles.categoryText, { 
                color: isDark ? palette.tint : Colors.light.tint,
                backgroundColor: isDark 
                  ? `${palette.tint}20` 
                  : `${Colors.light.tint}15`
              }]}
            >
              {item.category}
            </ThemedText>
          </View>
        )}

        {/* Location with improved icon and spacing */}
        {!!item.city && (
          <View style={styles.locationContainer}>
            <ThemedText 
              type="callout" 
              style={styles.locationText}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              📍 {item.city}{item.neighborhood ? ` • ${item.neighborhood}` : ''}
            </ThemedText>
          </View>
        )}

        {/* Description with better line height and spacing */}
        {!!item.description && (
          <ThemedText 
            type="body" 
            style={styles.description}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {item.description}
          </ThemedText>
        )}
      </View>
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
    gap: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    lineHeight: 21,
  },
  categoryContainer: {
    marginBottom: Spacing['2xs'],
    marginTop: Spacing['3xs'],
  },
  categoryText: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing['2xs'],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 21,
  },
  description: {
    marginTop: 16,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.41,
  },
});

