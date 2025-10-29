import React from 'react';
import { View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { StarRating } from '@/components/review';
import type { Item } from '@/types';

type ItemHeaderProps = {
  item: Item;
};

/**
 * ItemHeader component - displays item details header section
 * 
 * Features:
 * - Item image display
 * - Title, rating, and category
 * - Location information
 * - Description
 */
export function ItemHeader({ item }: ItemHeaderProps) {
  return (
    <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden', marginBottom: 24 }}>
      {item.photos?.[0] && (
        <ExpoImage
          source={{ uri: item.photos[0] }}
          style={{ width: "100%", height: 280 }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={item.photos[0]}
        />
      )}
      <View style={{ padding: 20 }}>
        <ThemedText type="title-1" style={{ marginBottom: 12, fontWeight: '600' }}>
          {item.title}
        </ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <StarRating value={item.ratingAvg ?? 0} />
          {!!item.ratingCount && (
            <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
              ({item.ratingCount} avaliações)
            </ThemedText>
          )}
        </View>
        {!!item.category && (
          <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ marginBottom: 8 }}>
            {item.category}
          </ThemedText>
        )}
        {!!item.city && (
          <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
            📍 {item.city} {item.neighborhood ? `• ${item.neighborhood}` : ""}
          </ThemedText>
        )}
        {!!item.description && (
          <ThemedText type="body" style={{ marginTop: 16 }} className="text-light-text-secondary dark:text-dark-text-secondary">
            {item.description}
          </ThemedText>
        )}
      </View>
    </LiquidGlassView>
  );
}

