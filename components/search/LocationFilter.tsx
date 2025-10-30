/**
 * LocationFilter - City and neighborhood text inputs and dropdown filters
 */

import React from 'react';
import { View, TextInput } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { DropdownFilter } from '@/components/DropdownFilter';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type LocationFilterProps = {
  // Text input props (legacy)
  city?: string;
  neighborhood?: string;
  onCityChange?: (text: string) => void;
  onNeighborhoodChange?: (text: string) => void;
  
  // Dropdown props (new)
  cities?: string[];
  neighborhoods?: string[];
  selectedCity?: string;
  selectedNeighborhood?: string;
  onCitySelect?: (city: string) => void;
  onNeighborhoodSelect?: (neighborhood: string) => void;
  locationsLoading?: boolean;
  
  style?: any;
};

export const LocationFilter = React.memo(function LocationFilter({
  city,
  neighborhood,
  onCityChange,
  onNeighborhoodChange,
  cities = [],
  neighborhoods = [],
  selectedCity = '',
  selectedNeighborhood = '',
  onCitySelect,
  onNeighborhoodSelect,
  locationsLoading = false,
  style,
}: LocationFilterProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  // Use dropdowns if available, otherwise fall back to text inputs
  const useDropdowns = (cities.length > 0 || neighborhoods.length > 0) && 
                       (onCitySelect || onNeighborhoodSelect);

  if (useDropdowns) {
    return (
      <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
        {cities.length > 0 && onCitySelect && (
          <View style={{ flex: 1 }}>
            <DropdownFilter
              title="Filtrar por Cidade"
              options={cities}
              selectedValue={selectedCity}
              onValueChange={onCitySelect}
              placeholder="Todas as cidades"
              icon="location"
              loading={locationsLoading}
            />
          </View>
        )}
        
        {neighborhoods.length > 0 && onNeighborhoodSelect && (
          <View style={{ flex: 1 }}>
            <DropdownFilter
              title="Filtrar por Bairro"
              options={neighborhoods}
              selectedValue={selectedNeighborhood}
              onValueChange={onNeighborhoodSelect}
              placeholder="Todos os bairros"
              icon="location-outline"
              loading={locationsLoading}
            />
          </View>
        )}
      </View>
    );
  }

  // Legacy text inputs - use key props to maintain focus on re-renders
  return (
    <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
      <View style={{ flex: 1 }}>
        <LiquidGlassView intensity="subtle" cornerRadius={16}>
          <TextInput
            key="city-input"
            placeholder="Cidade"
            placeholderTextColor={palette.textTertiary}
            value={city}
            onChangeText={onCityChange}
            autoCapitalize="words"
            style={{
              width: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: 'transparent',
              color: palette.text,
              fontSize: 17,
            }}
            accessibilityLabel="Filtrar por cidade"
            accessibilityHint="Digite o nome da cidade"
          />
        </LiquidGlassView>
      </View>
      <View style={{ flex: 1 }}>
        <LiquidGlassView intensity="subtle" cornerRadius={16}>
          <TextInput
            key="neighborhood-input"
            placeholder="Bairro"
            placeholderTextColor={palette.textTertiary}
            value={neighborhood}
            onChangeText={onNeighborhoodChange}
            autoCapitalize="words"
            style={{
              width: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: 'transparent',
              color: palette.text,
              fontSize: 17,
            }}
            accessibilityLabel="Filtrar por bairro"
            accessibilityHint="Digite o nome do bairro"
          />
        </LiquidGlassView>
      </View>
    </View>
  );
});

