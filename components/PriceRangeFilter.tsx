/**
 * Price range filter component
 */

import React from 'react';
import { View, TouchableOpacity, ViewStyle, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { HapticFeedback } from '@/utils';
import { useThemeColors } from '@/utils/theme';

export interface PriceRange {
  id: string;
  label: string;
  min: number | null; // null means no minimum
  max: number | null; // null means no maximum
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'free', label: 'Grátis', min: 0, max: 0 },
  { id: '0-50', label: 'R$ 0-50', min: 0, max: 50 },
  { id: '50-100', label: 'R$ 50-100', min: 50, max: 100 },
  { id: '100-200', label: 'R$ 100-200', min: 100, max: 200 },
  { id: '200-500', label: 'R$ 200-500', min: 200, max: 500 },
  { id: '500+', label: 'R$ 500+', min: 500, max: null },
];

type PriceRangeFilterProps = {
  title: string;
  priceRanges?: PriceRange[];
  selectedRangeIds: string[];
  onSelectionChange: (rangeIds: string[]) => void;
  style?: ViewStyle;
};

/**
 * Checkbox filter component for selecting price ranges
 */
export function PriceRangeFilter({
  title,
  priceRanges = PRICE_RANGES,
  selectedRangeIds,
  onSelectionChange,
  style,
}: PriceRangeFilterProps) {
  const colors = useThemeColors();

  const toggleSelection = (rangeId: string) => {
    HapticFeedback.selection();
    if (selectedRangeIds.includes(rangeId)) {
      onSelectionChange(selectedRangeIds.filter((id) => id !== rangeId));
    } else {
      onSelectionChange([...selectedRangeIds, rangeId]);
    }
  };

  if (priceRanges.length === 0) {
    return null;
  }

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        <Ionicons
          name="cash"
          size={18}
          color={colors.text.primary}
        />
        <ThemedText
          type="caption-1"
          style={{ fontWeight: '600', color: colors.text.primary }}
        >
          {title}
        </ThemedText>
        {selectedRangeIds.length > 0 && (
          <ThemedText
            type="caption-2"
            style={{ color: colors.text.secondary }}
          >
            ({selectedRangeIds.length})
          </ThemedText>
        )}
      </View>

      {/* Checkbox Options */}
      <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ maxHeight: 200 }}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 200 }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 12,
              gap: 8,
            }}
          >
            {priceRanges.map((range) => {
              const isSelected = selectedRangeIds.includes(range.id);
              
              return (
                <TouchableOpacity
                  key={range.id}
                  onPress={() => toggleSelection(range.id)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? colors.semantic.primary + '20'
                      : colors.input.bg,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? colors.semantic.primary
                      : colors.border.default,
                    minHeight: 44,
                    gap: 8,
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${range.label}, ${isSelected ? 'selecionado' : 'não selecionado'}`}
                  accessibilityHint="Toque duas vezes para selecionar ou desmarcar"
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? colors.semantic.primary : colors.icon.default}
                  />
                  <ThemedText
                    type="caption-1"
                    style={{
                      color: isSelected ? colors.text.primary : colors.text.secondary,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {range.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LiquidGlassView>
    </View>
  );
}

