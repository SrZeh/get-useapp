/**
 * ThemeSelector - Theme mode picker component
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { SunnyIcon, MoonIcon, PhonePortraitIcon, CheckmarkCircleIcon } from '@/assets/icons/theme-icons';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ThemeMode = 'light' | 'dark' | 'system';

type IconComponent = React.ComponentType<{ 
  width?: number; 
  height?: number; 
  color?: string; 
  fill?: string;
  stroke?: string;
}>;

type ThemeSelectorProps = {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  colors: UseThemeColorsReturn;
  borderOpacity: { default: string };
  brandOpacity: {
    primary: { medium: string };
    dark: { medium: string };
  };
};

export const ThemeSelector = React.memo(function ThemeSelector({
  themeMode,
  onThemeChange,
  colors,
  borderOpacity,
  brandOpacity,
}: ThemeSelectorProps) {
  const themeOptions: {
    mode: ThemeMode;
    label: string;
    icon: IconComponent;
  }[] = [
    { mode: 'light', label: 'Claro', icon: SunnyIcon },
    { mode: 'dark', label: 'Escuro', icon: MoonIcon },
    { mode: 'system', label: 'Automático', icon: PhonePortraitIcon },
  ];

  return (
    <LiquidGlassView intensity="standard" cornerRadius={24} style={styles.container}>
      <ThemedText type="title-small" style={styles.title}>
        Aparência
      </ThemedText>
      <View style={styles.options}>
        {themeOptions.map((option) => {
          const isSelected = themeMode === option.mode;
          return (
            <TouchableOpacity
              key={option.mode}
              onPress={() => onThemeChange(option.mode)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected 
                    ? (colors.isDark ? brandOpacity.primary.medium : brandOpacity.dark.medium)
                    : 'transparent',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected 
                    ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                    : borderOpacity.default,
                },
              ]}
            >
              <View style={styles.optionContent}>
                {(() => {
                  const Icon = option.icon;
                  return (
                    <Icon
                      width={24}
                      height={24}
                      color={isSelected
                        ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                        : colors.text.tertiary}
                      fill={isSelected
                        ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                        : colors.text.tertiary}
                    />
                  );
                })()}
                <ThemedText type="body" style={{ fontWeight: isSelected ? '600' : '400' }}>
                  {option.label}
                </ThemedText>
              </View>
              {isSelected && (
                <CheckmarkCircleIcon
                  width={24}
                  height={24}
                  color={colors.isDark ? colors.brand.primary : colors.brand.dark}
                  stroke={colors.isDark ? colors.brand.primary : colors.brand.dark}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </LiquidGlassView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  options: {
    gap: Spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});

