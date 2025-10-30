/**
 * Price min/max dropdown filter component
 */

import React, { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils/theme';
import { DollarIcon } from '@/assets/icons/category-icons';
import { Picker } from '@react-native-picker/picker';
import { PRICE_OPTIONS } from './PriceRangeFilter';
import { Spacing, BorderRadius } from '@/constants/spacing';

type PriceInputFilterProps = {
  minPrice?: number | null;
  maxPrice?: number | null;
  onMinPriceChange?: (price: number | null) => void;
  onMaxPriceChange?: (price: number | null) => void;
  style?: ViewStyle;
};

/**
 * Get the value ID from a price value
 */
function getValueId(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'none';
  }
  const found = PRICE_OPTIONS.find((opt) => opt.value === value);
  return found ? found.id : 'none';
}

/**
 * Get the value from an option ID
 */
function getValueFromId(id: string): number | null {
  const found = PRICE_OPTIONS.find((opt) => opt.id === id);
  return found ? found.value : null;
}

/**
 * Price min/max dropdown filter component
 */
export const PriceInputFilter = memo(function PriceInputFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  style,
}: PriceInputFilterProps) {
  const colors = useThemeColors();

  const minPriceId = getValueId(minPrice);
  const maxPriceId = getValueId(maxPrice);

  const handleMinPriceChange = (id: string) => {
    const value = getValueFromId(id);
    onMinPriceChange?.(value);
  };

  const handleMaxPriceChange = (id: string) => {
    const value = getValueFromId(id);
    onMaxPriceChange?.(value);
  };

  return (
    <View style={style}>
      {/* Min and Max Price Dropdowns */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Min Price */}
        {onMinPriceChange && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <DollarIcon
                width={18}
                height={18}
                color={colors.text.primary}
                stroke={colors.text.primary}
              />
              <ThemedText
                type="caption-1"
                style={{ fontWeight: '600', color: colors.text.primary }}
              >
                Preço Mín
              </ThemedText>
            </View>
            <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md}>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: BorderRadius.md,
                  borderColor: colors.border.default,
                  backgroundColor: 'transparent',
                }}
              >
                <Picker
                  selectedValue={minPriceId}
                  onValueChange={handleMinPriceChange}
                  dropdownIconColor={colors.text.primary}
                  style={{
                    color: colors.text.primary,
                    backgroundColor: 'transparent',
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                    borderRadius: BorderRadius.md,
                  }}
                  accessibilityLabel="Preço mínimo"
                  accessibilityHint="Selecione o preço mínimo"
                >
                  {PRICE_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.id}
                      label={option.label}
                      value={option.id}
                      color={colors.text.primary}
                    />
                  ))}
                </Picker>
              </View>
            </LiquidGlassView>
          </View>
        )}

        {/* Max Price */}
        {onMaxPriceChange && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <DollarIcon
                width={18}
                height={18}
                color={colors.text.primary}
                stroke={colors.text.primary}
              />
              <ThemedText
                type="caption-1"
                style={{ fontWeight: '600', color: colors.text.primary }}
              >
                Preço Máx
              </ThemedText>
            </View>
            <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md}>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: BorderRadius.md,
                  borderColor: colors.border.default,
                  backgroundColor: 'transparent',
                }}
              >
                <Picker
                  selectedValue={maxPriceId}
                  onValueChange={handleMaxPriceChange}
                  dropdownIconColor={colors.text.primary}
                  style={{
                    color: colors.text.primary,
                    backgroundColor: 'transparent',
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                    borderRadius: BorderRadius.md,
                  }}
                  accessibilityLabel="Preço máximo"
                  accessibilityHint="Selecione o preço máximo"
                >
                  {PRICE_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.id}
                      label={option.label}
                      value={option.id}
                      color={colors.text.primary}
                    />
                  ))}
                </Picker>
              </View>
            </LiquidGlassView>
          </View>
        )}
      </View>
    </View>
  );
});
