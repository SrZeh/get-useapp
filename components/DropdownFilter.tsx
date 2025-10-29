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
import { Spacing, BorderRadius } from '@/constants/spacing';

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
    <View style={[{ marginBottom: Spacing.xs }, style]}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing['2xs'], gap: Spacing['2xs'] }}>
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
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            dropdownIconColor={colors.text.primary}
            style={{
              color: colors.text.primary,
              backgroundColor: 'transparent',
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.xs,
              borderRadius: BorderRadius.md,
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

