/**
 * Price range dropdown filter component
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils/theme';
import { PRICE_RANGES, type PriceRange } from './PriceRangeFilter';

type PriceRangeDropdownProps = {
  title: string;
  selectedRangeId: string;
  onValueChange: (rangeId: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  loading?: boolean;
};

/**
 * Dropdown filter component for selecting price ranges
 */
export function PriceRangeDropdown({
  title,
  selectedRangeId,
  onValueChange,
  placeholder = 'Selecione...',
  style,
  loading = false,
}: PriceRangeDropdownProps) {
  const colors = useThemeColors();

  if (loading || PRICE_RANGES.length === 0) {
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
      </View>

      {/* Dropdown */}
      <LiquidGlassView intensity="subtle" cornerRadius={16}>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 16,
            borderColor: colors.border.default,
            backgroundColor: 'transparent',
            overflow: 'hidden',
          }}
        >
          <Picker
            selectedValue={selectedRangeId}
            onValueChange={onValueChange}
            dropdownIconColor={colors.text.primary}
            style={{
              color: colors.text.primary,
              backgroundColor: 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            accessibilityLabel={title}
            accessibilityHint="Selecione uma faixa de preço"
          >
            <Picker.Item
              label={placeholder}
              value=""
              color={colors.input.placeholder}
            />
            {PRICE_RANGES.map((range) => (
              <Picker.Item
                key={range.id}
                label={range.label}
                value={range.id}
                color={colors.text.primary}
              />
            ))}
          </Picker>
        </View>
      </LiquidGlassView>
    </View>
  );
}

