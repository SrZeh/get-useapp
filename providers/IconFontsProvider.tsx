import React, { type ReactNode } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type IconFontsProviderProps = {
  children: ReactNode;
};

/**
 * Ensures vector icon fonts are loaded before rendering UI.
 * Prevents missing icons on web/static hosting and native.
 */
export function IconFontsProvider({ children }: IconFontsProviderProps) {
  const [loaded] = useFonts({
    // Ionicons and MaterialIcons are used across the app
    ...(Ionicons as unknown as { font: Record<string, number> }).font,
    ...(MaterialIcons as unknown as { font: Record<string, number> }).font,
  });

  if (!loaded) {
    // Render nothing until fonts are ready to avoid icon fallback/layout shift
    return null;
  }

  return <>{children}</>;
}


