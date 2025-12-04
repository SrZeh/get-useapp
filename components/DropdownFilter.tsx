/**
 * Dropdown filter component for single selection
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ThemedText } from '@/components/themed-text';
import { LocationIcon } from '@/assets/icons/location-icon';
import { CidadeIcon } from '@/assets/icons/cidade-icon';
import { BairroIcon } from '@/assets/icons/bairro-icon';
import { useThemeColors } from '@/utils/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';

type IconComponent = React.ComponentType<{ 
  width?: number; 
  height?: number; 
  color?: string; 
  fill?: string;
  stroke?: string;
}>;

type DropdownFilterProps = {
  title: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  icon?: boolean;
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

  // Determine which icon to use based on title
  // Use darker green (#4CAF50) in light theme, default green (#96FF9A) in dark theme
  const iconColor = isDark ? '#96FF9A' : '#4CAF50';
  
  const getIcon = () => {
    if (!icon) return null;
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('cidade')) {
      return (
        <CidadeIcon
          width={18}
          height={18}
          color={iconColor}
        />
      );
    }
    if (titleLower.includes('bairro')) {
      return (
        <BairroIcon
          width={18}
          height={18}
          color={iconColor}
        />
      );
    }
    // Fallback to LocationIcon for other cases
    return (
      <LocationIcon
        width={18}
        height={18}
        color={colors.text.primary}
        stroke={colors.text.primary}
      />
    );
  };

  return (
    <View style={[{ marginBottom: Spacing.xs }, style]}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing['2xs'], gap: Spacing['2xs'] }}>
        {getIcon()}
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

