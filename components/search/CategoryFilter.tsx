/**
 * CategoryFilter - Category chips with icons
 */

import React, { useMemo } from 'react';
import { ScrollableCategories } from '@/components/ScrollableCategories';
import { CategoryChip } from '@/components/CategoryChip';
import {
  FlashIcon,
  HammerIcon,
  ConstructIcon,
  CutIcon,
  LeafIcon,
  TrailSignIcon,
  FootballIcon,
  BicycleIcon,
  CameraIcon,
  MusicalNotesIcon,
  LaptopIcon,
  TvIcon,
  RestaurantIcon,
  BalloonIcon,
  HomeIcon,
  CarIcon,
  HeartIcon,
  GameControllerIcon,
  PawIcon,
  MedicalIcon,
  AppsIcon,
} from '@/assets/icons/category-icons';

type CategoryIconComponent = React.ComponentType<{ 
  width?: number; 
  height?: number; 
  color?: string; 
  fill?: string;
  stroke?: string;
}>;

const CATEGORY_ICONS: Record<string, CategoryIconComponent> = {
  'Ferramentas elétricas': FlashIcon,
  'Ferramentas manuais': HammerIcon,
  'Construção & Reforma': ConstructIcon,
  'Marcenaria & Carpintaria': CutIcon,
  'Jardinagem': LeafIcon,
  'Camping & Trilha': TrailSignIcon,
  'Esportes & Lazer': FootballIcon,
  'Mobilidade (bike/patinete)': BicycleIcon,
  'Fotografia & Vídeo': CameraIcon,
  'Música & Áudio': MusicalNotesIcon,
  'Informática & Acessórios': LaptopIcon,
  'Eletroportáteis': TvIcon,
  'Cozinha & Utensílios': RestaurantIcon,
  'Eventos & Festas': BalloonIcon,
  'Móveis & Decoração': HomeIcon,
  'Automotivo & Moto': CarIcon,
  'Bebê & Infantil': HeartIcon,
  'Brinquedos & Jogos': GameControllerIcon,
  'Pet': PawIcon,
  'Saúde & Beleza': MedicalIcon,
  'Outros': AppsIcon,
};

type CategoryFilterProps = {
  selectedCategory: string;
  categories: readonly string[];
  onCategoryChange: (category: string) => void;
};

function CategoryFilterComponent({
  selectedCategory,
  categories,
  onCategoryChange,
}: CategoryFilterProps) {
  const renderChip = useMemo(() => {
    function render(label: string, value: string) {
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
    }
    return render;
  }, [selectedCategory, onCategoryChange]);

  return (
    <ScrollableCategories>
      {renderChip('Todas', '')}
      {categories.map((c) => renderChip(c, c))}
    </ScrollableCategories>
  );
}

CategoryFilterComponent.displayName = 'CategoryFilter';
export const CategoryFilter = React.memo(CategoryFilterComponent);

