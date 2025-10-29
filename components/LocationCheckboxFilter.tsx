/**
 * Checkbox filter component for locations (cities/neighborhoods)
 */

import React from 'react';
import { View, TouchableOpacity, ViewStyle, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { HapticFeedback } from '@/utils';
import { useThemeColors } from '@/utils/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type LocationCheckboxFilterProps = {
  title: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

/**
 * Checkbox filter component for selecting multiple locations
 */
export function LocationCheckboxFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
  loading = false,
  icon,
  style,
}: LocationCheckboxFilterProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const toggleSelection = (value: string) => {
    HapticFeedback.selection();
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  if (loading || options.length === 0) {
    return null;
  }

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={colors.text.primary}
          />
        )}
        <ThemedText
          type="caption-1"
          style={{ fontWeight: '600', color: colors.text.primary }}
        >
          {title}
        </ThemedText>
        {selectedValues.length > 0 && (
          <ThemedText
            type="caption-2"
            style={{ color: colors.text.secondary }}
          >
            ({selectedValues.length})
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
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => toggleSelection(option)}
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
                  accessibilityLabel={`${option}, ${isSelected ? 'selecionado' : 'não selecionado'}`}
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
                    {option}
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

