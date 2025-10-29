import React from 'react';
import { View, TextInput, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ScrollableCategories } from '@/components/ScrollableCategories';
import { ShimmerLoader } from '@/components/ShimmerLoader';
import { CategoryChip } from '@/components/CategoryChip';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CategoryIconMap = Record<string, keyof typeof Ionicons.glyphMap>;

const CATEGORY_ICONS: CategoryIconMap = {
  'Ferramentas elétricas': 'flash',
  'Ferramentas manuais': 'hammer',
  'Construção & Reforma': 'construct',
  'Marcenaria & Carpintaria': 'cut',
  'Jardinagem': 'leaf',
  'Camping & Trilha': 'trail-sign',
  'Esportes & Lazer': 'football',
  'Mobilidade (bike/patinete)': 'bicycle',
  'Fotografia & Vídeo': 'camera',
  'Música & Áudio': 'musical-notes',
  'Informática & Acessórios': 'laptop',
  'Eletroportáteis': 'tv',
  'Cozinha & Utensílios': 'restaurant',
  'Eventos & Festas': 'balloon',
  'Móveis & Decoração': 'home',
  'Automotivo & Moto': 'car',
  'Bebê & Infantil': 'heart',
  'Brinquedos & Jogos': 'game-controller',
  'Pet': 'paw',
  'Saúde & Beleza': 'medical',
  'Outros': 'apps',
};

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

  const renderChip = (label: string, value: string) => {
    const active = category === value;
    const icon = value ? CATEGORY_ICONS[value] : undefined;
    return (
      <CategoryChip
        key={value || '_all'}
        label={label}
        selected={active}
        onPress={() => onCategoryChange(active ? '' : value)}
        icon={icon}
      />
    );
  };

  return (
    <View
      style={[
        {
          paddingHorizontal: screenPadding,
          paddingTop: 16,
          paddingBottom: 8,
          width: '100%',
          backgroundColor: palette.background,
        },
        style,
      ]}
    >
      {/* Title */}
      <ThemedText
        type="large-title"
        style={{ textAlign: 'center', marginBottom: 8 }}
        className="text-light-text-primary dark:text-dark-text-primary"
      >
        Precisou?
      </ThemedText>

      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 300, height: 150 }}
          contentFit="contain"
          transition={200}
        />
      </View>

      {/* Prompt */}
      <ThemedText
        type="callout"
        style={{ marginBottom: 12 }}
        className="text-light-text-primary dark:text-dark-text-secondary"
      >
        O que você quer alugar?
      </ThemedText>

      {/* Search Input */}
      <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="Buscar por título, descrição…"
          placeholderTextColor={palette.textTertiary}
          value={search}
          onChangeText={onSearchChange}
          style={{
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: 'transparent',
            color: palette.text,
            fontSize: 17,
          }}
          accessibilityLabel="Buscar itens"
          accessibilityHint="Digite para buscar por título ou descrição"
        />
      </LiquidGlassView>

      {/* Location Filters */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <LiquidGlassView intensity="subtle" cornerRadius={16}>
            <TextInput
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

      {/* Category Chips */}
      <ScrollableCategories>
        {renderChip('Todas', '')}
        {categories.map((c) => renderChip(c, c))}
      </ScrollableCategories>

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

