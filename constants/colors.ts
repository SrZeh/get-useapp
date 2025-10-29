/**
 * Extended Color Palette with Gradients
 * Brand Color: #96ff9a (Mint Green)
 */

export const ExtendedColors = {
  // Brand Gradient Palette
  brand: {
    primary: '#96ff9a',
    secondary: '#80e685', // Slightly darker for depth
    tertiary: '#6acc6f', // Even darker for buttons
    dark: '#08af0e',
    light: '#b3ffb5',
    glow: '#ccffe0', // Soft glow effect
  },

  // Premium Gradient Colors (for featured items)
  premium: {
    start: '#96ff9a',
    middle: '#7fe884',
    end: '#66cc6b',
    accent: '#b3ffb5',
  },

  // Status Gradient Colors
  success: {
    start: '#08af0e',
    end: '#00ce08',
    glow: '#40ef47',
  },

  // Trust & Safety Indicators
  trust: {
    verified: '#08af0e',
    pending: '#f59e0b',
    warning: '#ef4444',
    background: 'rgba(8, 175, 14, 0.1)',
  },

  // Interactive States
  interactive: {
    hover: '#80e685',
    pressed: '#6acc6f',
    disabled: '#cbd5e1',
    focus: '#96ff9a',
  },

  // Dark Mode Enhancements
  darkMode: {
    surface: '#0f1416',
    elevated: '#151a1c',
    overlay: 'rgba(21, 23, 24, 0.85)',
    glow: 'rgba(150, 255, 154, 0.15)',
  },
} as const;

