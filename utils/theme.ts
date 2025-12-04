/**
 * Centralized Theme Utilities
 * 
 * This module provides all theme colors and utilities in a centralized location.
 * All components should use these utilities instead of hardcoding colors.
 * 
 * Usage:
 *   import { useThemeColors } from '@/utils/theme';
 *   const colors = useThemeColors();
 *   // Use colors.bg.primary, colors.text.primary, etc.
 */

import { Colors } from '@/constants/theme';
import { ExtendedColors } from '@/constants/colors';
import { useColorScheme } from '@/providers/ThemeProvider';

// Re-export for convenience
export { useTheme as useThemeMode } from '@/providers/ThemeProvider';
export type { ThemeMode } from '@/providers/ThemeProvider';

/**
 * Theme color structure - provides all colors organized by category
 */
export type ThemeColors = {
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // UI element colors
  border: {
    default: string;
    alt: string;
  };
  card: {
    bg: string;
  };
  input: {
    bg: string;
    placeholder: string;
  };
  // Brand colors (theme-agnostic)
  brand: {
    primary: string;
    secondary: string;
    tertiary: string;
    dark: string;
    light: string;
    glow: string;
  };
  // Semantic colors (theme-agnostic)
  semantic: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  // Icon colors
  icon: {
    default: string;
    selected: string;
  };
  // Status indicator for dark mode
  isDark: boolean;
};

/**
 * Hook that provides all theme colors based on current color scheme
 * 
 * @example
 * ```tsx
 * const colors = useThemeColors();
 * <View style={{ backgroundColor: colors.bg.primary }}>
 *   <Text style={{ color: colors.text.primary }}>Hello</Text>
 * </View>
 * ```
 */
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme = Colors[colorScheme];
  
  return {
    text: {
      primary: theme.text,
      secondary: theme.textSecondary,
      tertiary: theme.textTertiary,
      quaternary: theme.textQuaternary,
    },
    bg: {
      primary: theme.background,
      secondary: theme.backgroundSecondary,
      tertiary: theme.backgroundTertiary,
    },
    border: {
      default: theme.border,
      alt: theme.borderAlt,
    },
    card: {
      bg: theme.cardBg,
    },
    input: {
      bg: theme.inputBg,
      placeholder: isDark ? 'rgba(203, 213, 225, 0.5)' : 'rgba(107, 114, 128, 0.6)',
    },
    brand: {
      primary: ExtendedColors.brand.primary,
      secondary: ExtendedColors.brand.secondary,
      tertiary: ExtendedColors.brand.tertiary,
      dark: ExtendedColors.brand.dark,
      light: ExtendedColors.brand.light,
      glow: ExtendedColors.brand.glow,
    },
    semantic: {
      // Use theme-aware semantic colors for proper contrast
      success: isDark ? ExtendedColors.success.darkMode : ExtendedColors.success.lightMode,
      error: isDark ? ExtendedColors.error.darkMode : ExtendedColors.error.lightMode,
      warning: isDark ? ExtendedColors.warning.darkMode : ExtendedColors.warning.lightMode,
      info: isDark ? ExtendedColors.info.darkMode : ExtendedColors.info.lightMode,
    },
    icon: {
      default: theme.icon,
      selected: theme.tabIconSelected,
    },
    isDark,
  };
}

/**
 * Get theme-aware color value
 * Returns light or dark color based on current theme
 * 
 * @example
 * ```tsx
 * const bgColor = useThemeValue({ light: '#ffffff', dark: '#151718' });
 * ```
 */
export function useThemeValue<T>(values: { light: T; dark: T }): T {
  const colorScheme = useColorScheme();
  return values[colorScheme];
}

/**
 * Get color from theme constants by key
 * 
 * @example
 * ```tsx
 * const textColor = useThemeColor('text');
 * ```
 */
export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const colorScheme = useColorScheme();
  return Colors[colorScheme][colorName];
}

/**
 * Glass effect background colors with opacity
 * Uses ExtendedColors for consistency with design system
 */
export function useGlassColors() {
  const colors = useThemeColors();
  
  return {
    subtle: colors.isDark
      ? ExtendedColors.darkMode.glass.subtle
      : ExtendedColors.lightMode.glass.subtle,
    standard: colors.isDark
      ? ExtendedColors.darkMode.glass.standard
      : ExtendedColors.lightMode.glass.standard,
    strong: colors.isDark
      ? ExtendedColors.darkMode.glass.strong
      : ExtendedColors.lightMode.glass.strong,
    hover: colors.isDark
      ? 'rgba(11, 18, 32, 0.8)'
      : 'rgba(249, 250, 251, 0.9)',
    flat: colors.isDark
      ? 'rgba(11, 18, 32, 0.6)'
      : 'rgba(249, 250, 251, 0.8)',
  };
}

/**
 * Border colors with opacity for glass effects
 */
export function useGlassBorders() {
  const colors = useThemeColors();
  
  return {
    subtle: colors.isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)',
    standard: colors.isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.08)',
    strong: colors.isDark
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Category chip colors based on selection state
 * Uses theme-aware colors for WCAG compliance
 */
export function useChipColors(selected: boolean) {
  const colors = useThemeColors();
  
  // Theme-aware brand color for chips
  // No dark mode usa verde claro (#96ff9a), no light mode usa verde escuro (#08af0e)
  const brandBgColor = colors.isDark ? colors.brand.primary : colors.brand.dark;
  
  return {
    bg: selected ? brandBgColor : 'transparent',
    border: selected ? 'transparent' : colors.border.default,
    // No dark mode com verde claro, usa texto escuro. No light mode com verde escuro, usa branco
    text: selected
      ? (colors.isDark ? colors.text.primary : '#ffffff')
      : colors.text.tertiary,
    icon: selected
      ? (colors.isDark ? colors.text.primary : '#ffffff')
      : colors.text.tertiary,
  };
}

/**
 * Button variant colors
 * Uses theme-aware colors for WCAG-compliant contrast
 */
export function useButtonColors(variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive') {
  const colors = useThemeColors();
  
  // Theme-aware brand color: use dark green in light mode for contrast, light green in dark mode
  const brandColor = colors.isDark ? ExtendedColors.brand.darkMode : ExtendedColors.brand.lightMode;
  
  const variants = {
    primary: {
      bg: colors.brand.primary,
      text: TEXT_ON_COLOR.white,
      border: 'transparent',
    },
    secondary: {
      bg: 'transparent',
      text: brandColor,
      border: brandColor,
    },
    ghost: {
      bg: 'transparent',
      text: brandColor,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: colors.text.primary,
      border: colors.border.default,
    },
    destructive: {
      bg: colors.semantic.error,
      text: TEXT_ON_COLOR.white,
      border: 'transparent',
    },
  };
  
  return variants[variant];
}

/**
 * Convert hex color to rgba with specified opacity
 * 
 * @param hex - Hex color string (e.g., '#96ff9a' or '96ff9a')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 * 
 * @example
 * ```tsx
 * const brandWithOpacity = hexToRgba('#96ff9a', 0.2);
 * ```
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get theme colors with opacity for brand colors
 * Useful for subtle backgrounds, highlights, etc.
 */
export function useBrandColorsWithOpacity() {
  const colors = useThemeColors();
  
  return {
    primary: {
      subtle: hexToRgba(colors.brand.primary, 0.1),
      light: hexToRgba(colors.brand.primary, 0.15),
      medium: hexToRgba(colors.brand.primary, 0.2),
      strong: hexToRgba(colors.brand.primary, 0.3),
    },
    dark: {
      subtle: hexToRgba(colors.brand.dark, 0.1),
      light: hexToRgba(colors.brand.dark, 0.15),
      medium: hexToRgba(colors.brand.dark, 0.2),
      strong: hexToRgba(colors.brand.dark, 0.3),
    },
  };
}

export type BrandColorsWithOpacity = ReturnType<typeof useBrandColorsWithOpacity>;

/**
 * Get border colors with opacity based on theme
 */
export function useBorderColorsWithOpacity() {
  const colors = useThemeColors();
  
  return {
    subtle: colors.isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)',
    default: colors.isDark
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)',
    strong: colors.isDark
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.15)',
  };
}

/**
 * Get NativeWind class names for backgrounds
 * Useful for components that prefer className over style prop
 */
export function useBackgroundClasses() {
  const colors = useThemeColors();
  
  return {
    primary: colors.isDark ? 'bg-dark-bg-primary' : 'bg-light-bg-primary',
    secondary: colors.isDark ? 'bg-dark-bg-secondary' : 'bg-light-bg-secondary',
    tertiary: colors.isDark ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary',
  };
}

/**
 * Get NativeWind class names for text colors
 */
export function useTextClasses() {
  const colors = useThemeColors();
  
  return {
    primary: colors.isDark ? 'text-dark-text-primary' : 'text-light-text-primary',
    secondary: colors.isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary',
    tertiary: colors.isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary',
    quaternary: colors.isDark ? 'text-dark-text-quaternary' : 'text-light-text-quaternary',
  };
}

/**
 * Constants for text on colored backgrounds
 * Use these when you need white or black text on colored backgrounds
 */
export const TEXT_ON_COLOR = {
  /** White text for use on colored backgrounds (buttons, badges, etc.) */
  white: '#ffffff',
  /** Black/dark text for use on light colored backgrounds (light mode brand colors) */
  black: '#0a0a0a',
} as const;

