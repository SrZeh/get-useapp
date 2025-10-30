/**
 * SearchHeader - Search and filter interface for items
 * 
 * Refactored to use extracted components:
 * - SearchHeaderBranding: Logo and title
 * - SearchBar: Search input
 * - SearchFilters: All filter controls (location, price, category)
 * 
 * Enhanced with debounced inputs for better UX:
 * - All text inputs (search, city, neighborhood) update immediately (responsive typing)
 * - Filter updates are debounced (waits 400ms after user stops typing)
 * - Enter key on search input triggers immediate search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import { ShimmerLoader } from '@/components/ShimmerLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchHeaderBranding } from './SearchHeaderBranding';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
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
  const externalSearch = filterConfig?.search?.value ?? searchProp ?? '';
  const onSearchChange = filterConfig?.search?.onChange ?? onSearchChangeProp ?? (() => {});
  const externalCity = filterConfig?.city?.value ?? cityProp ?? '';
  const onCityChange = filterConfig?.city?.onChange ?? onCityChangeProp ?? (() => {});
  const externalNeighborhood = filterConfig?.neighborhood?.value ?? neighborhoodProp ?? '';
  const onNeighborhoodChange = filterConfig?.neighborhood?.onChange ?? onNeighborhoodChangeProp ?? (() => {});

  // Local state for immediate input updates (responsive UX)
  const [localSearch, setLocalSearch] = useState(externalSearch);
  const [localCity, setLocalCity] = useState(externalCity);
  const [localNeighborhood, setLocalNeighborhood] = useState(externalNeighborhood);

  // Sync local state with external prop changes (e.g., when filter is cleared externally)
  // Only sync when external value changes, not when local state changes
  useEffect(() => {
    setLocalSearch(externalSearch);
  }, [externalSearch]);

  useEffect(() => {
    setLocalCity(externalCity);
  }, [externalCity]);

  useEffect(() => {
    setLocalNeighborhood(externalNeighborhood);
  }, [externalNeighborhood]);

  // Debounce the search value - waits 400ms after user stops typing
  // This prevents aggressive filtering on every keystroke
  const debouncedSearch = useDebounce(localSearch, 400);
  const debouncedCity = useDebounce(localCity, 400);
  const debouncedNeighborhood = useDebounce(localNeighborhood, 400);

  // Update the parent filter when debounced values change
  // Skip if the debounced value matches external (prevents unnecessary updates)
  useEffect(() => {
    if (debouncedSearch !== externalSearch) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, externalSearch, onSearchChange]);

  useEffect(() => {
    if (debouncedCity !== externalCity) {
      onCityChange(debouncedCity);
    }
  }, [debouncedCity, externalCity, onCityChange]);

  useEffect(() => {
    if (debouncedNeighborhood !== externalNeighborhood) {
      onNeighborhoodChange(debouncedNeighborhood);
    }
  }, [debouncedNeighborhood, externalNeighborhood, onNeighborhoodChange]);

  // Handle immediate input changes (updates local state immediately)
  const handleSearchChange = useCallback((text: string) => {
    setLocalSearch(text);
  }, []);

  const handleCityChange = useCallback((text: string) => {
    setLocalCity(text);
  }, []);

  const handleNeighborhoodChange = useCallback((text: string) => {
    setLocalNeighborhood(text);
  }, []);

  // Handle submit (Enter key) - triggers immediate search without waiting for debounce
  const handleSubmit = useCallback(() => {
    if (localSearch !== externalSearch) {
      onSearchChange(localSearch);
    }
  }, [localSearch, externalSearch, onSearchChange]);

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

      {/* Search Input - uses local state for responsive typing */}
      <SearchBar
        value={localSearch}
        onChangeText={handleSearchChange}
        onSubmit={handleSubmit}
        style={{ marginBottom: 12 }}
      />

      {/* All Filters - Location, Price, Category */}
      <SearchFilters
        city={localCity}
        onCityChange={handleCityChange}
        neighborhood={localNeighborhood}
        onNeighborhoodChange={handleNeighborhoodChange}
        category={categoryProp}
        onCategoryChange={onCategoryChangeProp}
        categories={categoriesProp}
        cities={cities}
        neighborhoods={neighborhoods}
        selectedCity={selectedCity}
        selectedNeighborhood={selectedNeighborhood}
        onCitySelect={onCitySelect}
        onNeighborhoodSelect={onNeighborhoodSelect}
        locationsLoading={locationsLoading}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
        filterConfig={filterConfig}
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

