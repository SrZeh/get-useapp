/**
 * Filter system types for extensible filtering
 */

import type { ReactNode } from 'react';

/**
 * Filter type identifiers
 */
export type FilterType = 'search' | 'category' | 'location' | 'city' | 'neighborhood';

/**
 * Base filter option interface
 */
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon?: string; // Icon name (e.g., Ionicons glyph name)
  count?: number; // Optional count indicator
}

/**
 * Filter configuration for a specific filter type
 */
export interface FilterConfig {
  /**
   * Filter type identifier
   */
  type: FilterType;

  /**
   * Filter label/placeholder
   */
  label: string;

  /**
   * Current filter value
   */
  value: string;

  /**
   * Callback when filter changes
   */
  onChange: (value: string) => void;

  /**
   * Available options (for dropdown/select filters)
   */
  options?: FilterOption[];

  /**
   * Optional custom renderer for the filter UI
   */
  renderCustom?: (config: FilterConfig) => ReactNode;

  /**
   * Whether filter is enabled
   */
  enabled?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * Complete filter configuration
 */
export type FilterConfiguration = {
  [K in FilterType]?: FilterConfig;
};

