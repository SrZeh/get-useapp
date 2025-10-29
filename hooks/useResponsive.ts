import { Dimensions, Platform, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const breakpoints = {
  xs: 0, // Mobile (default)
  sm: 640, // Small tablets
  md: 768, // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Desktops
  '2xl': 1536, // Large screens
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  const getBreakpoint = (): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  return {
    width,
    height,
    breakpoint: getBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
}

// Hook for conditional rendering based on breakpoints
export function useBreakpoint() {
  const { breakpoint } = useResponsive();

  return {
    breakpoint,
    is: (bp: Breakpoint | Breakpoint[]) => {
      const bps = Array.isArray(bp) ? bp : [bp];
      return bps.includes(breakpoint);
    },
    isAtLeast: (bp: Breakpoint) => {
      const bpValues = Object.values(breakpoints);
      const currentIndex = bpValues.indexOf(breakpoints[breakpoint]);
      const targetIndex = bpValues.indexOf(breakpoints[bp]);
      return currentIndex >= targetIndex;
    },
    isAtMost: (bp: Breakpoint) => {
      const bpValues = Object.values(breakpoints);
      const currentIndex = bpValues.indexOf(breakpoints[breakpoint]);
      const targetIndex = bpValues.indexOf(breakpoints[bp]);
      return currentIndex <= targetIndex;
    },
  };
}

