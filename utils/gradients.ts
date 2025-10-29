import { LinearGradient } from 'expo-linear-gradient';
import { ExtendedColors } from '@/constants/colors';
import { useColorScheme } from '@/providers/ThemeProvider';

/**
 * Gradient configurations using ExtendedColors
 * All gradients use theme-aware colors for WCAG compliance
 */
export const GradientTypes = {
  brand: {
    colors: [ExtendedColors.brand.primary, ExtendedColors.brand.secondary, ExtendedColors.brand.tertiary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  premium: {
    colors: [ExtendedColors.brand.primary, ExtendedColors.premium.middle, ExtendedColors.premium.end],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  success: {
    colors: [ExtendedColors.success.start, ExtendedColors.success.end],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  overlay: {
    // Uses brand color with opacity for glow effects
    colors: ['rgba(150, 255, 154, 0.1)', 'rgba(150, 255, 154, 0.05)', 'transparent'], // Brand glow overlay
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  dark: {
    colors: [ExtendedColors.darkMode.background.primary, '#0a0d0f', ExtendedColors.darkMode.background.tertiary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export type GradientType = keyof typeof GradientTypes;

/**
 * Get theme-aware gradient colors
 * Useful for components that need gradients based on theme
 */
export function useThemeGradients() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    brand: GradientTypes.brand,
    premium: GradientTypes.premium,
    success: {
      colors: isDark 
        ? [ExtendedColors.success.darkMode, ExtendedColors.success.glow]
        : [ExtendedColors.success.lightMode, ExtendedColors.success.end],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    error: {
      colors: isDark
        ? [ExtendedColors.error.darkMode, ExtendedColors.error.light]
        : [ExtendedColors.error.lightMode, ExtendedColors.error.primary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    warning: {
      colors: isDark
        ? [ExtendedColors.warning.darkMode, ExtendedColors.warning.light]
        : [ExtendedColors.warning.lightMode, ExtendedColors.warning.primary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    info: {
      colors: isDark
        ? [ExtendedColors.info.darkMode, ExtendedColors.info.light]
        : [ExtendedColors.info.lightMode, ExtendedColors.info.primary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  };
}

