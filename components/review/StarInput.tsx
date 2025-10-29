import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type StarInputProps = {
  n: number;
  rating: number;
  onPress: (value: number) => void;
  size?: number;
};

/**
 * StarInput component - interactive star for rating input
 * 
 * @param n - Star number (1-5)
 * @param rating - Current rating value
 * @param onPress - Callback when star is pressed
 * @param size - Font size for stars (default: 24)
 */
export function StarInput({ n, rating, onPress, size = 24 }: StarInputProps) {
  const active = n <= rating;
  return (
    <TouchableOpacity onPress={() => onPress(n)}>
      <ThemedText style={{ fontSize: size }}>{active ? '★' : '☆'}</ThemedText>
    </TouchableOpacity>
  );
}

