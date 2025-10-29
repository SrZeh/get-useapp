/**
 * useResponsiveGrid - Hook for calculating responsive grid layout
 * 
 * Handles grid column calculations and card sizing based on screen width.
 * Extracted from screen components for reusability.
 */

import { useMemo } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

export interface ResponsiveGridConfig {
  numColumns: number;
  cardWidth: number;
  cardSpacing: number;
  screenPadding: number;
}

/**
 * Hook for responsive grid layout calculations
 * 
 * @param cardSpacing - Spacing between cards in pixels (default: 12)
 * @returns Grid configuration with columns, card width, spacing, and padding
 */
export function useResponsiveGrid(cardSpacing = 12): ResponsiveGridConfig {
  const { width: screenWidth, isMobile, isTablet } = useResponsive();

  // Calculate responsive values
  const numColumns = useMemo(() => {
    if (screenWidth >= 1536) return 5; // 2xl
    if (screenWidth >= 1280) return 4; // xl
    if (screenWidth >= 1024) return 3; // lg
    if (screenWidth >= 768) return 2;  // md/tablet
    return 1; // Mobile: single column
  }, [screenWidth]);

  const screenPadding = useMemo(() => {
    if (isMobile) return 16;
    if (isTablet) return 24;
    return 32;
  }, [isMobile, isTablet]);

  const cardWidth = useMemo(() => {
    if (numColumns > 1) {
      return (screenWidth - (screenPadding * 2) - (cardSpacing * (numColumns - 1))) / numColumns;
    }
    return screenWidth - (screenPadding * 2);
  }, [numColumns, screenWidth, screenPadding, cardSpacing]);

  return {
    numColumns,
    cardWidth,
    cardSpacing,
    screenPadding,
  };
}

