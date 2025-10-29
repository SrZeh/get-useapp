import { useResponsive } from './useResponsive';

export function useResponsiveSpacing() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Base spacing scale (mobile-first)
  const baseScale = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  };

  // Scale multiplier based on screen size
  const scale = isDesktop ? 1.25 : isTablet ? 1.1 : 1;

  return {
    xs: baseScale.xs * scale,
    sm: baseScale.sm * scale,
    md: baseScale.md * scale,
    lg: baseScale.lg * scale,
    xl: baseScale.xl * scale,
    '2xl': baseScale['2xl'] * scale,
    '3xl': baseScale['3xl'] * scale,
    // Container padding
    containerPadding: isMobile ? 16 : isTablet ? 24 : 32,
    // Section spacing
    sectionSpacing: isMobile ? 24 : isTablet ? 32 : 48,
  };
}

