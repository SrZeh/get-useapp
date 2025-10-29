import React from 'react';
import { ThemedText } from '@/components/themed-text';

type StarRatingProps = {
  value: number;
  size?: number;
};

/**
 * StarRating component - displays a star rating
 * 
 * @param value - Rating value (0-5)
 * @param size - Font size for stars (default: 18)
 */
export function StarRating({ value, size = 18 }: StarRatingProps) {
  const rounded = Math.round(value || 0);
  return <ThemedText style={{ fontSize: size }}>{'★'.repeat(rounded).padEnd(5, '☆')}</ThemedText>;
}

