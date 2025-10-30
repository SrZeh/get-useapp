import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StarRatingProps = {
  value: number;
  size?: number;
  showEmpty?: boolean;
};

/**
 * StarRating component - displays a visual star rating with colored stars
 * 
 * @param value - Rating value (0-5)
 * @param size - Font size for stars (default: 16)
 * @param showEmpty - Whether to show empty stars (default: true)
 */
export function StarRating({ value, size = 16, showEmpty = true }: StarRatingProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Brand color for filled stars
  const starColor = isDark ? '#96ff9a' : '#08af0e';
  // Muted color for empty stars
  const emptyStarColor = isDark ? '#4a5568' : '#d1d5db';
  
  // Clamp value between 0 and 5
  const clampedValue = Math.max(0, Math.min(5, value || 0));
  
  // Round to nearest integer for star count
  const fullStars = Math.round(clampedValue);
  const emptyStars = 5 - fullStars;
  
  return (
    <View style={[styles.container, { gap: size * 0.15 }]}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <ThemedText
          key={`full-${i}`}
          style={{ fontSize: size, color: starColor }}
        >
          ★
        </ThemedText>
      ))}
      {showEmpty && Array.from({ length: emptyStars }).map((_, i) => (
        <ThemedText
          key={`empty-${i}`}
          style={{ fontSize: size, color: emptyStarColor }}
        >
          ★
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

