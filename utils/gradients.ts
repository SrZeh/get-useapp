import { LinearGradient } from 'expo-linear-gradient';

export const GradientTypes = {
  brand: {
    colors: ['#96ff9a', '#80e685', '#6acc6f'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  premium: {
    colors: ['#96ff9a', '#7fe884', '#66cc6b'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  success: {
    colors: ['#08af0e', '#00ce08'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  overlay: {
    colors: ['rgba(150, 255, 154, 0.1)', 'rgba(150, 255, 154, 0.05)', 'transparent'],
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

// Re-export LinearGradient for convenience
export { LinearGradient };

