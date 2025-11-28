import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/utils';

type StarInputProps = {
  n: number;
  rating: number;
  onPress: (value: number) => void;
  size?: number;
};

/**
 * StarInput component - interactive star for rating input
 * 
 * Displays outlined stars (☆) that fill (★) with brand green color when selected.
 * 
 * @param n - Star number (1-5)
 * @param rating - Current rating value
 * @param onPress - Callback when star is pressed
 * @param size - Font size for stars (default: 32)
 */
export function StarInput({ n, rating, onPress, size = 32 }: StarInputProps) {
  const colors = useThemeColors();
  const active = n <= rating;
  
  // Brand green color for filled stars
  const starColor = colors.brand.primary;
  // Muted color for empty stars (outlined)
  const emptyStarColor = colors.text.tertiary;
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(n)}
      activeOpacity={0.7}
      style={{ padding: 4 }}
    >
      <ThemedText 
        style={{ 
          fontSize: size,
          color: active ? starColor : emptyStarColor,
        }}
      >
        {active ? '★' : '☆'}
      </ThemedText>
    </TouchableOpacity>
  );
}

