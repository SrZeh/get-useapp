/**
 * Web-specific styles component
 * This ensures global CSS is loaded on web platform and injects CSS variables
 * from the React theme system for dynamic theming.
 * 
 * For NativeWind v4 with Expo, CSS should be imported directly.
 * CSS variables are injected via JavaScript to connect React theme to CSS.
 */
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { logger } from '@/utils';
import { useThemeColors } from '@/utils/theme';
import { useColorScheme } from '@/providers/ThemeProvider';

// Direct CSS import for web (works with Expo web build)
if (Platform.OS === 'web') {
  try {
    // @ts-ignore - CSS imports work in web builds
    require('../global.css');
  } catch (error) {
    // CSS file may not be found in development, that's okay
    logger.warn('Could not load global.css', { error });
  }
}

/**
 * Injects CSS variables into the document root based on current theme
 * This connects the React theme system to CSS variables in global.css
 */
export function WebStyles() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colors.isDark;

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    
    // Toggle dark class on HTML element (for CSS .dark selectors)
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Inject brand colors (theme-agnostic, always same)
    root.style.setProperty('--brand-primary', colors.brand.primary);
    root.style.setProperty('--brand-secondary', colors.brand.secondary);
    root.style.setProperty('--brand-dark', colors.brand.dark);
    root.style.setProperty('--brand-light', colors.brand.light);

    // Inject background colors
    root.style.setProperty('--bg-primary', colors.bg.primary);
    root.style.setProperty('--bg-secondary', colors.bg.secondary);
    root.style.setProperty('--bg-tertiary', colors.bg.tertiary);

    // Inject text colors
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);
    root.style.setProperty('--text-quaternary', colors.text.quaternary);

    // Inject border colors
    root.style.setProperty('--border-default', colors.border.default);
    root.style.setProperty('--border-alt', colors.border.alt);

    // Inject input colors
    root.style.setProperty('--input-bg', colors.input.bg);
    root.style.setProperty('--input-text', colors.text.primary);
    root.style.setProperty('--input-border', colors.border.default);
    root.style.setProperty(
      '--input-border-focus',
      isDark ? colors.brand.primary : colors.brand.dark
    );

    // Inject badge colors
    root.style.setProperty('--badge-primary-bg', colors.brand.primary);
    root.style.setProperty('--badge-primary-text', colors.text.primary); // Dark text on light green
    root.style.setProperty('--badge-success-bg', colors.semantic.success);
    root.style.setProperty('--badge-success-text', '#ffffff');
    root.style.setProperty('--badge-warning-bg', colors.semantic.warning);
    root.style.setProperty('--badge-warning-text', '#ffffff');
    root.style.setProperty('--badge-error-bg', colors.semantic.error);
    root.style.setProperty('--badge-error-text', '#ffffff');

    // Inject semantic colors
    root.style.setProperty('--error-primary', colors.semantic.error);

    // Glass effect colors are handled via .dark class in CSS
    // Shimmer and scrollbar colors are handled via .dark class in CSS

    // Log for debugging (only in development)
    if (__DEV__) {
      logger.debug('CSS variables injected', {
        theme: colorScheme,
        isDark,
        bgPrimary: colors.bg.primary,
      });
    }
  }, [colors, colorScheme, isDark]);

  return null;
}

