/**
 * Design system colors aligned with iOS 26 Liquid Glass Design System
 * Brand Color: #96ff9a (Light Green/Mint)
 * 
 * For most styling, prefer using NativeWind classes directly.
 * This file is maintained for backwards compatibility with themed components.
 */

import { Platform } from 'react-native';

// Brand color tint for light mode (darker green)
const tintColorLight = '#151718';
// Brand color for dark mode
const tintColorDark = '#96ff9a';

export const Colors = {
  light: {
    // Text colors
    text: '#11181C', // light-text-primary
    textSecondary: '#111827', // light-text-secondary
    textTertiary: '#374151', // light-text-tertiary
    textQuaternary: '#6b7280', // light-text-quaternary
    
    // Background colors
    background: '#ffffff', // light-bg-primary (white for clean look)
    backgroundSecondary: '#f9fafb', // light-bg-secondary
    backgroundTertiary: '#f3f4f6', // light-bg-tertiary
    
    // UI colors
    tint: '#08af0e', // Use darker green for better contrast on light backgrounds
    icon: '#687076', // neutral-400 equivalent
    tabIconDefault: '#687076',
    tabIconSelected: '#08af0e', // Darker green for better contrast
    
    // Borders
    border: '#e5e7eb', // border-light
    borderAlt: '#d1d5db', // border-light-alt
    
    // Card/Container
    cardBg: '#f9fafb', // card-light-bg
    
    // Input
    inputBg: '#ffffff', // input-light-bg
    
    // Semantic colors
    success: '#08af0e', // success-primary
    error: '#ef4444', // error-primary
    warning: '#f59e0b', // warning-primary
    info: '#2563eb', // info-primary
  },
  dark: {
    // Text colors
    text: '#96ff9a', // dark-text-primary (brand color)
    textSecondary: '#e5e7eb', // dark-text-secondary
    textTertiary: '#cbd5e1', // dark-text-tertiary
    textQuaternary: '#ffffff', // dark-text-quaternary
    
    // Background colors
    background: '#151718', // dark-bg-primary
    backgroundSecondary: '#111214', // dark-bg-secondary
    backgroundTertiary: '#0b1220', // dark-bg-tertiary
    
    // UI colors
    tint: tintColorDark,
    icon: '#9BA1A6', // neutral-400 equivalent
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // Borders
    border: '#374151', // border-dark
    borderAlt: '#2a2a2a', // border-dark-alt
    
    // Card/Container
    cardBg: '#0b1220', // card-dark-bg
    
    // Input
    inputBg: '#111827', // input-dark-bg
    
    // Semantic colors
    success: '#08af0e', // success-primary
    error: '#ef4444', // error-primary
    warning: '#f59e0b', // warning-primary
    info: '#2563eb', // info-primary
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
