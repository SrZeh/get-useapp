/**
 * SearchHeader - Search and filter interface for items
 * 
 * Refactored to use extracted components:
 * - SearchHeaderBranding: Logo and title
 * - SearchBar: Search input
 * - LocationFilter: City and neighborhood filters
 * - CategoryFilter: Category chips
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ShimmerLoader } from '@/components/ShimmerLoader';
import { PriceInputFilter } from '@/components/PriceInputFilter';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SearchHeaderBranding } from './SearchHeaderBranding';
import { SearchBar } from './SearchBar';
import { LocationFilter } from './LocationFilter';
import { CategoryFilter } from './CategoryFilter';
import type { FilterConfiguration } from './types';

type SearchHeaderProps = {
  // Legacy props (for backward compatibility)
  search?: string;
  onSearchChange?: (text: string) => void;
  city?: string;
  onCityChange?: (text: string) => void;
  neighborhood?: string;
  onNeighborhoodChange?: (text: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: readonly string[];
  loading?: boolean;
  screenPadding?: number;
  style?: ViewStyle;
  /**
   * New configurable filter system - if provided, uses this instead of legacy props
   * Allows adding new filter types without modifying the component
   */
  filterConfig?: FilterConfiguration;
  // Dropdown filter props
  cities?: string[];
  neighborhoods?: string[];
  selectedCity?: string;
  selectedNeighborhood?: string;
  onCitySelect?: (city: string) => void;
  onNeighborhoodSelect?: (neighborhood: string) => void;
  locationsLoading?: boolean;
  // Price filter props
  minPrice?: number | null;
  maxPrice?: number | null;
  onMinPriceChange?: (price: number | null) => void;
  onMaxPriceChange?: (price: number | null) => void;
};

/**
 * SearchHeader component - search and filter interface for items
 * 
 * Features:
 * - Search input for title/description
 * - City and neighborhood filters
 * - Category chips with icons
 * - Logo display
 * - Loading state indicators
 */
export function SearchHeader({
  search: searchProp,
  onSearchChange: onSearchChangeProp,
  city: cityProp,
  onCityChange: onCityChangeProp,
  neighborhood: neighborhoodProp,
  onNeighborhoodChange: onNeighborhoodChangeProp,
  category: categoryProp,
  onCategoryChange: onCategoryChangeProp,
  categories: categoriesProp,
  loading = false,
  screenPadding = 16,
  style,
  filterConfig,
  cities = [],
  neighborhoods = [],
  selectedCity = '',
  selectedNeighborhood = '',
  onCitySelect,
  onNeighborhoodSelect,
  locationsLoading = false,
  minPrice = null,
  maxPrice = null,
  onMinPriceChange,
  onMaxPriceChange,
}: SearchHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  // Use filterConfig if provided, otherwise fall back to legacy props
  const search = filterConfig?.search?.value ?? searchProp ?? '';
  const onSearchChange = filterConfig?.search?.onChange ?? onSearchChangeProp ?? (() => {});
  const city = filterConfig?.city?.value ?? cityProp ?? '';
  const onCityChange = filterConfig?.city?.onChange ?? onCityChangeProp ?? (() => {});
  const neighborhood = filterConfig?.neighborhood?.value ?? neighborhoodProp ?? '';
  const onNeighborhoodChange = filterConfig?.neighborhood?.onChange ?? onNeighborhoodChangeProp ?? (() => {});
  const category = filterConfig?.category?.value ?? categoryProp ?? '';
  const onCategoryChange = filterConfig?.category?.onChange ?? onCategoryChangeProp ?? (() => {});
  const categories = filterConfig?.category?.options?.map(opt => opt.value) ?? categoriesProp ?? [];

  return (
    <View
      style={[
        {
          paddingHorizontal: screenPadding,
          paddingTop: 80, // Add top padding to account for transparent header
          paddingBottom: 8,
          width: '100%',
          backgroundColor: palette.background,
        },
        style,
      ]}
    >
      {/* Branding */}
      <SearchHeaderBranding />

      {/* Search Input */}
      <SearchBar
        value={search}
        onChangeText={onSearchChange}
        style={{ marginBottom: 12 }}
      />

      {/* Location Filters - Text Inputs (Legacy) */}
      {(onCityChange || onNeighborhoodChange) && (
        <LocationFilter
          city={city}
          neighborhood={neighborhood}
          onCityChange={onCityChange}
          onNeighborhoodChange={onNeighborhoodChange}
          style={{ marginBottom: 12 }}
        />
      )}

      {/* Dropdown Filters for Cities, Neighborhoods, and Price */}
      {((cities.length > 0 || neighborhoods.length > 0) && (onCitySelect || onNeighborhoodSelect)) || (onMinPriceChange || onMaxPriceChange) ? (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Location Filters - Dropdowns */}
            {(cities.length > 0 || neighborhoods.length > 0) && (onCitySelect || onNeighborhoodSelect) && (
              <View style={{ flex: 1 }}>
                <LocationFilter
                  cities={cities}
                  neighborhoods={neighborhoods}
                  selectedCity={selectedCity}
                  selectedNeighborhood={selectedNeighborhood}
                  onCitySelect={onCitySelect}
                  onNeighborhoodSelect={onNeighborhoodSelect}
                  locationsLoading={locationsLoading}
                />
              </View>
            )}
            
            {/* Price Min/Max Filters */}
            {(onMinPriceChange || onMaxPriceChange) && (
              <View style={{ flex: 1 }}>
                <PriceInputFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={onMinPriceChange}
                  onMaxPriceChange={onMaxPriceChange}
                />
              </View>
            )}
          </View>
        </View>
      ) : null}

      {/* Category Chips */}
      <CategoryFilter
        selectedCategory={category}
        categories={categories}
        onCategoryChange={onCategoryChange}
      />

      {/* Loading State */}
      {loading && (
        <View style={{ paddingVertical: 16, paddingHorizontal: screenPadding }}>
          <ShimmerLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <ShimmerLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          <ShimmerLoader height={120} borderRadius={12} />
        </View>
      )}
    </View>
  );
}

