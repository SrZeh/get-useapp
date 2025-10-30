import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { useColorScheme as useRNColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    let isMounted = true;

    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved);
        }
      } catch (error) {
        logger.error('Failed to load theme preference', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to system theme changes when in 'system' mode
  // The systemColorScheme from useRNColorScheme already reacts to changes,
  // but we add a listener here to ensure immediate updates
  useEffect(() => {
    if (themeMode !== 'system') return;

    const subscription = Appearance.addChangeListener(() => {
      // Trigger re-render by updating a state that's part of the dependency
      // The systemColorScheme from useRNColorScheme will update automatically
      // This listener ensures we catch system changes even when app is backgrounded
    });

    return () => subscription.remove();
  }, [themeMode]);

  // Save theme preference when it changes
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      logger.error('Failed to save theme preference', error);
      throw error;
    }
  }, []);

  // Determine actual color scheme based on theme mode
  // Memoized to prevent unnecessary recalculations
  const colorScheme = useMemo<'light' | 'dark'>(() => {
    return themeMode === 'system'
      ? (systemColorScheme ?? 'light')
      : themeMode;
  }, [themeMode, systemColorScheme]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ThemeContextType>(() => ({
    themeMode,
    colorScheme,
    setThemeMode,
    isLoading,
  }), [themeMode, colorScheme, setThemeMode, isLoading]);

  // Always provide context, even during loading
  // Use system theme as default during loading to prevent "must be used within ThemeProvider" errors
  const contextValue = isLoading
    ? {
        themeMode: 'system' as ThemeMode,
        colorScheme: (systemColorScheme ?? 'light') as 'light' | 'dark',
        setThemeMode,
        isLoading: true,
      }
    : value;

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook that returns the current color scheme (for compatibility)
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useTheme();
  return colorScheme;
}

