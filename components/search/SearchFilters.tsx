/**
 * SearchFilters - Filter section component
 * 
 * Encapsulates all filter controls (location, price, category) for better maintainability.
 * Separated from SearchHeader to follow single responsibility principle.
 * 
 * Memoized to prevent unnecessary re-renders when other filters change.
 */

import React, { useMemo, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import { LocationFilter } from './LocationFilter';
import { PriceInputFilter } from '@/components/PriceInputFilter';
import { CategoryFilter } from './CategoryFilter';
import type { FilterConfiguration } from './types';

type SearchFiltersProps = {
  // Legacy props
  city?: string;
  onCityChange?: (text: string) => void;
  neighborhood?: string;
  onNeighborhoodChange?: (text: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: readonly string[];
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
  // New configurable filter system
  filterConfig?: FilterConfiguration;
  // Style
  style?: ViewStyle;
};

/**
 * SearchFilters component
 * Renders location, price, and category filters
 */
export const SearchFilters = React.memo(function SearchFilters({
  city: cityProp,
  onCityChange: onCityChangeProp,
  neighborhood: neighborhoodProp,
  onNeighborhoodChange: onNeighborhoodChangeProp,
  category: categoryProp,
  onCategoryChange: onCategoryChangeProp,
  categories: categoriesProp,
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
  filterConfig,
  style,
}: SearchFiltersProps) {
  // Use filterConfig if provided, otherwise fall back to legacy props
  const city = useMemo(() => filterConfig?.city?.value ?? cityProp ?? '', [filterConfig?.city?.value, cityProp]);
  const neighborhood = useMemo(() => filterConfig?.neighborhood?.value ?? neighborhoodProp ?? '', [filterConfig?.neighborhood?.value, neighborhoodProp]);
  const category = useMemo(() => filterConfig?.category?.value ?? categoryProp ?? '', [filterConfig?.category?.value, categoryProp]);
  const categories = useMemo(() => filterConfig?.category?.options?.map(opt => opt.value) ?? categoriesProp ?? [], [filterConfig?.category?.options, categoriesProp]);
  
  // Stabilize callbacks to prevent unnecessary re-renders
  const onCityChange = useCallback((text: string) => {
    const handler = filterConfig?.city?.onChange ?? onCityChangeProp;
    handler?.(text);
  }, [filterConfig?.city?.onChange, onCityChangeProp]);
  
  const onNeighborhoodChange = useCallback((text: string) => {
    const handler = filterConfig?.neighborhood?.onChange ?? onNeighborhoodChangeProp;
    handler?.(text);
  }, [filterConfig?.neighborhood?.onChange, onNeighborhoodChangeProp]);
  
  const onCategoryChange = useCallback((cat: string) => {
    const handler = filterConfig?.category?.onChange ?? onCategoryChangeProp;
    handler?.(cat);
  }, [filterConfig?.category?.onChange, onCategoryChangeProp]);

  return (
    <View style={style}>
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
    </View>
  );
});

