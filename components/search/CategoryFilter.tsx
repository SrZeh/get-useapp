/**
 * CategoryFilter - Category chips with icons
 */

import React, { useMemo } from 'react';
import { ScrollableCategories } from '@/components/ScrollableCategories';
import { CategoryChip } from '@/components/CategoryChip';
import { Ionicons } from '@expo/vector-icons';

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

type CategoryFilterProps = {
  selectedCategory: string;
  categories: readonly string[];
  onCategoryChange: (category: string) => void;
};

export const CategoryFilter = React.memo(function CategoryFilter({
  selectedCategory,
  categories,
  onCategoryChange,
}: CategoryFilterProps) {
  const renderChip = useMemo(() => {
    return (label: string, value: string) => {
      const active = selectedCategory === value;
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
  }, [selectedCategory, onCategoryChange]);

  return (
    <ScrollableCategories>
      {renderChip('Todas', '')}
      {categories.map((c) => renderChip(c, c))}
    </ScrollableCategories>
  );
});

