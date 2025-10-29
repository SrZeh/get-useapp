/**
 * Spacing Constants - iOS 26 Liquid Glass Design System
 * 
 * Use these constants instead of hardcoded pixel values to maintain
 * consistency with the design system.
 * 
 * @example
 * ```tsx
 * import { Spacing } from '@/constants/spacing';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: Spacing.sm, // 16px
 *     gap: Spacing.md,     // 24px
 *   }
 * });
 * ```
 */

export const Spacing = {
  /** 2px - Very tight spacing */
  '4xs': 2,
  /** 4px - Tight spacing */
  '3xs': 4,
  /** 8px - Compact spacing */
  '2xs': 8,
  /** 12px - Small spacing */
  xs: 12,
  /** 16px - Default spacing (most common) */
  sm: 16,
  /** 24px - Medium spacing */
  md: 24,
  /** 32px - Large spacing */
  lg: 32,
  /** 48px - Extra large spacing */
  xl: 48,
  /** 64px - 2X large spacing */
  '2xl': 64,
  /** 96px - 3X large spacing */
  '3xl': 96,
} as const;

/**
 * Border Radius Constants - iOS 26 Liquid Glass Design System
 * 
 * Use these constants for consistent border radius values.
 * 
 * @example
 * ```tsx
 * import { BorderRadius } from '@/constants/spacing';
 * 
 * const styles = StyleSheet.create({
 *   card: {
 *     borderRadius: BorderRadius.xl, // 24px
 *   }
 * });
 * ```
 */
export const BorderRadius = {
  /** 4px - Very small radius */
  '2xs': 4,
  /** 8px - Small radius */
  xs: 8,
  /** 12px - Small buttons, small elements */
  sm: 12,
  /** 16px - Medium elements, inputs */
  md: 16,
  /** 20px - Default buttons */
  lg: 20,
  /** 24px - Default cards */
  xl: 24,
  /** 32px - Large cards */
  '2xl': 32,
  /** 48px - Hero sections */
  '3xl': 48,
  /** Full circle - for circular elements */
  full: 9999,
} as const;

/**
 * Typography Size Constants - iOS 26 Human Interface Guidelines
 * 
 * For reference only. Prefer using ThemedText component with type prop
 * instead of hardcoded font sizes.
 * 
 * @example
 * ```tsx
 * // ❌ Don't do this
 * <Text style={{ fontSize: 17 }}>
 * 
 * // ✅ Do this instead
 * <ThemedText type="body">
 * ```
 */
export const TypographySize = {
  'large-title': 34,
  'title-1': 28,
  'title-2': 22,
  'title-3': 20,
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  'caption-1': 12,
  'caption-2': 11,
} as const;

