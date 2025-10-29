/**
 * Web-specific styles component
 * This ensures global CSS is loaded on web platform
 * For NativeWind v4 with Expo, CSS should be imported directly
 */
import { Platform } from 'react-native';
import { logger } from '@/utils';

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

export function WebStyles() {
  // This component can be used to inject additional styles if needed
  // For now, the CSS is imported via require above
  return null;
}

