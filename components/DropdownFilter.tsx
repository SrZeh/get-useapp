/**
 * Dropdown filter component for single selection
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type DropdownFilterProps = {
  title: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  loading?: boolean;
};

/**
 * Dropdown filter component for selecting a single option
 */
export function DropdownFilter({
  title,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
  icon,
  style,
  loading = false,
}: DropdownFilterProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const palette = Colors[colorScheme];

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
      </View>

      {/* Dropdown */}
      <LiquidGlassView intensity="subtle" cornerRadius={16}>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 15,
            borderColor: colors.border.default,
            backgroundColor: 'transparent',
          }}
        >
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            dropdownIconColor={colors.text.primary}
            style={{
              color: colors.text.primary,
              backgroundColor: 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 15,
            }}
            accessibilityLabel={title}
            accessibilityHint="Selecione uma opção"
          >
            <Picker.Item
              label={placeholder}
              value=""
              color={colors.input.placeholder}
            />
            {options.map((option) => (
              <Picker.Item
                key={option}
                label={option}
                value={option}
                color={colors.text.primary}
              />
            ))}
          </Picker>
        </View>
      </LiquidGlassView>
    </View>
  );
}

