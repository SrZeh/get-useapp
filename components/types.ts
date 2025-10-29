/**
 * Common component prop types
 * 
 * Defines shared interfaces for components to ensure consistency
 * and enable Liskov Substitution Principle (LSP) compliance.
 */

import type { ViewStyle, ViewProps } from 'react-native';
import type { ReactNode } from 'react';

/**
 * Base card props interface
 * 
 * All card components should extend this interface to ensure
 * they can be substituted without breaking code.
 */
export type BaseCardProps = ViewProps & {
  /**
   * Callback fired when card is pressed
   */
  onPress?: () => void;

  /**
   * Optional width for the card
   */
  width?: number | string;

  /**
   * Custom style for the card container
   */
  style?: ViewStyle;

  /**
   * Whether the card is disabled
   */
  disabled?: boolean;

  /**
   * Accessibility label for the card
   */
  accessibilityLabel?: string;
};

/**
 * Base card props with children
 * 
 * For cards that wrap content
 */
export type BaseCardWithChildrenProps = BaseCardProps & {
  /**
   * Card content
   */
  children: ReactNode;
};

