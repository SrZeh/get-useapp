/**
 * Modern P2P Design System - 2025 Best Practices
 * Brand Color: #96ff9a (Light Green/Mint) - Strategic use only
 * 
 * Color Philosophy:
 * - Neutral, clean backgrounds for professional look
 * - Green used strategically for CTAs, success, trust indicators
 * - High contrast for accessibility (WCAG AA+)
 * - Modern gradient-based dark mode with depth
 * 
 * For most styling, prefer using NativeWind classes directly.
 * This file is maintained for backwards compatibility with themed components.
 */

import { Platform } from 'react-native';

// Brand color - used strategically for actions and accents
const brandPrimary = '#96ff9a'; // Primary brand green
const brandDark = '#08af0e'; // Darker green for better contrast on light

export const Colors = {
  light: {
    // Text colors - High contrast for readability
    text: '#0a0a0a', // light-text-primary (near black for maximum contrast)
    textSecondary: '#1f2937', // light-text-secondary (dark gray-800)
    textTertiary: '#4b5563', // light-text-tertiary (medium gray-600)
    textQuaternary: '#6b7280', // light-text-quaternary (lighter gray-500)
    
    // Background colors - Clean, neutral, professional
    background: '#ffffff', // light-bg-primary (pure white, not green!)
    backgroundSecondary: '#f9fafb', // light-bg-secondary (off-white gray-50)
    backgroundTertiary: '#f3f4f6', // light-bg-tertiary (light gray-100)
    
    // UI colors
    tint: brandDark, // Darker green for UI elements on light backgrounds
    icon: '#6b7280', // neutral-500 for default icons
    tabIconDefault: '#9ca3af', // neutral-400 for unselected tabs
    tabIconSelected: brandDark, // Brand green for selected state
    
    // Borders - Subtle, refined
    border: '#e5e7eb', // border-light (gray-200)
    borderAlt: '#d1d5db', // border-light-alt (gray-300)
    
    // Card/Container - Slightly elevated from background
    cardBg: '#ffffff', // card-light-bg (white with subtle shadow)
    
    // Input - Clean white backgrounds
    inputBg: '#ffffff', // input-light-bg
    
    // Semantic colors - Clear, distinct
    success: brandDark, // success-primary (brand green for trust)
    error: '#ef4444', // error-primary (clear red)
    warning: '#f59e0b', // warning-primary (amber)
    info: '#3b82f6', // info-primary (blue-500, more modern)
  },
  dark: {
    // Text colors - High contrast with green as accent only
    text: '#f9fafb', // dark-text-primary (off-white, not green - better readability)
    textSecondary: '#e5e7eb', // dark-text-secondary (light gray-200)
    textTertiary: '#cbd5e1', // dark-text-tertiary (lighter gray-300)
    textQuaternary: '#94a3b8', // dark-text-quaternary (gray-400)
    
    // Background colors - Modern dark grays with subtle warmth
    background: '#0f1419', // dark-bg-primary (warm dark, not pure black)
    backgroundSecondary: '#1a1f2e', // dark-bg-secondary (slightly lighter with blue tint)
    backgroundTertiary: '#0d1117', // dark-bg-tertiary (almost black for depth)
    
    // UI colors - Green for accents, neutral for defaults
    tint: brandPrimary, // Brand green for dark mode accents
    icon: '#94a3b8', // gray-400 for default icons
    tabIconDefault: '#64748b', // gray-500 for unselected tabs
    tabIconSelected: brandPrimary, // Brand green for selected state
    
    // Borders - Subtle but visible
    border: '#334155', // border-dark (slate-700)
    borderAlt: '#1e293b', // border-dark-alt (slate-800)
    
    // Card/Container - Elevated dark surface
    cardBg: '#1e293b', // card-dark-bg (slate-800 for elevation)
    
    // Input - Dark surfaces
    inputBg: '#1a1f2e', // input-dark-bg (slightly lighter than background)
    
    // Semantic colors - Adjusted for dark mode visibility
    success: brandPrimary, // Brand green for success (glows in dark mode)
    error: '#f87171', // error-primary (softer red for dark backgrounds)
    warning: '#fbbf24', // warning-primary (brighter amber)
    info: '#60a5fa', // info-primary (blue-400, more visible)
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
