/**
 * AppHeader - Global header configuration component
 * 
 * Provides reusable header options for React Navigation Stack screens.
 * Encapsulates all header-related configuration for better maintainability.
 * 
 * Features:
 * - Centered logo (HeaderLogo)
 * - Sidebar menu button (HeaderMenu)
 * - Auth/profile button (AuthHeaderRight)
 * - Liquid glass background effect
 * - Theme-aware styling
 */

import React, { useMemo } from 'react';
import type { StackNavigationOptions } from '@react-navigation/stack';
import { useThemeColors } from '@/utils';
import { HeaderLogo } from './HeaderLogo';
import { HeaderMenu } from '@/components/HeaderMenu';
import { AuthHeaderRight } from '@/components/features/auth';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Header configuration options
 */
export interface AppHeaderOptions {
  /**
   * Whether to show the header
   * @default true
   */
  headerShown?: boolean;
  /**
   * Custom title component (overrides default logo)
   */
  title?: React.ComponentType | string;
  /**
   * Custom header left component (overrides default menu)
   */
  headerLeft?: React.ComponentType | null;
  /**
   * Custom header right component (overrides default auth button)
   */
  headerRight?: React.ComponentType | null;
  /**
   * Whether to show header background (liquid glass effect)
   * @default true
   */
  showBackground?: boolean;
}

/**
 * Default header title component (centered logo)
 */
const HeaderTitleLogo = () => <HeaderLogo />;

/**
 * Default header background component (liquid glass effect)
 */
const HeaderBackground = () => (
  <LiquidGlassView
    intensity="subtle"
    tint="system"
    style={{
      flex: 1,
      borderWidth: 0,
    }}
  />
);

/**
 * Get default header options for React Navigation Stack
 * 
 * @param colors - Theme colors
 * @param options - Optional customization options
 * @returns StackNavigationOptions object
 */
export function getAppHeaderOptions(
  colors: ReturnType<typeof useThemeColors>,
  options: AppHeaderOptions = {}
): StackNavigationOptions {
  const {
    headerShown = true,
    title,
    headerLeft,
    headerRight,
    showBackground = true,
  } = options;

  const headerOptions: StackNavigationOptions = {
    headerShown,
    headerTitleAlign: 'center' as const,
    headerTitle: title 
      ? (typeof title === 'string' ? title : title)
      : HeaderTitleLogo,
    headerLeft: headerLeft === null 
      ? undefined 
      : (headerLeft || (() => <HeaderMenu />)),
    headerRight: headerRight === null 
      ? undefined 
      : (headerRight || (() => <AuthHeaderRight />)),
    headerTransparent: true,
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
  };

  if (showBackground) {
    headerOptions.headerBackground = HeaderBackground;
  }

  return headerOptions;
}

/**
 * Hook to get memoized header options
 * 
 * Automatically updates when theme changes.
 * 
 * @param options - Optional customization options
 * @returns Memoized StackNavigationOptions object
 */
export function useAppHeaderOptions(options: AppHeaderOptions = {}) {
  const colors = useThemeColors();
  const { user } = useAuth();

  return useMemo(
    () => {
      const authAwareOptions: AppHeaderOptions = { ...options };

      if (!user) {
        authAwareOptions.headerLeft = null;
      }

      return getAppHeaderOptions(colors, authAwareOptions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, user, options.headerShown, options.title, options.headerLeft, options.headerRight, options.showBackground]
  );
}

