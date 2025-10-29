import { LinearGradient } from 'expo-linear-gradient';
import { ExtendedColors } from '@/constants/colors';

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
    // Uses brand color with opacity - note: rgba values need to be computed from hex if we want to reference ExtendedColors
    colors: ['rgba(150, 255, 154, 0.1)', 'rgba(150, 255, 154, 0.05)', 'transparent'], // Brand glow overlay
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  dark: {
    colors: ['#151718', '#0f1416', '#0a0d0f'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export type GradientType = keyof typeof GradientTypes;

