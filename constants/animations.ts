/**
 * Animation Constants
 * 
 * Standardized animation timings and configurations following the iOS 26 Liquid Glass
 * design system guidelines (animations should be under 400ms for fluidity).
 * 
 * All animations use react-native-reanimated for optimal performance.
 */

/**
 * Animation durations in milliseconds
 */
export const AnimationDuration = {
  /** Ultra-fast transitions (buttons, micro-interactions) */
  fast: 150,
  /** Standard transitions (most UI interactions) */
  standard: 200,
  /** Smooth transitions (cards, modals) */
  smooth: 300,
  /** Maximum allowed duration per design system (400ms) */
  maximum: 400,
} as const;

/**
 * Animation easing functions
 * Using react-native-reanimated Easing functions
 */
export const AnimationEasing = {
  /** Standard easing for most animations */
  standard: 'ease-in-out' as const,
  /** Spring-like easing for natural motion */
  spring: 'spring' as const,
  /** Ease out for entering elements */
  easeOut: 'ease-out' as const,
  /** Ease in for exiting elements */
  easeIn: 'ease-in' as const,
} as const;

/**
 * Pre-configured animation configs for common use cases
 */
export const AnimationConfigs = {
  /** Fast scale animation for button presses */
  buttonPress: {
    duration: AnimationDuration.fast,
    type: 'spring' as const,
    damping: 15,
    stiffness: 300,
  },

  /** Fade in animation */
  fadeIn: {
    duration: AnimationDuration.standard,
    easing: AnimationEasing.easeOut,
  },

  /** Fade out animation */
  fadeOut: {
    duration: AnimationDuration.fast,
    easing: AnimationEasing.easeIn,
  },

  /** Slide up animation */
  slideUp: {
    duration: AnimationDuration.smooth,
    easing: AnimationEasing.easeOut,
  },

  /** Slide down animation */
  slideDown: {
    duration: AnimationDuration.smooth,
    easing: AnimationEasing.easeOut,
  },

  /** Scale in animation */
  scaleIn: {
    duration: AnimationDuration.standard,
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },

  /** Subtle pulse animation */
  pulse: {
    duration: AnimationDuration.smooth,
    easing: AnimationEasing.standard,
  },

  /** Modal entrance animation */
  modalEnter: {
    duration: AnimationDuration.smooth,
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
  },

  /** Card hover animation */
  cardHover: {
    duration: AnimationDuration.fast,
    easing: AnimationEasing.standard,
  },
} as const;

/**
 * Animation presets for common React Native Reanimated operations
 */
export const ReanimatedPresets = {
  /** Spring config for button press feedback */
  buttonPress: {
    damping: 15,
    stiffness: 300,
    mass: 0.5,
  },

  /** Spring config for modal animations */
  modal: {
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  },

  /** Spring config for card interactions */
  card: {
    damping: 20,
    stiffness: 250,
    mass: 0.6,
  },

  /** Timing config for fade animations */
  fade: {
    duration: AnimationDuration.standard,
  },

  /** Timing config for slide animations */
  slide: {
    duration: AnimationDuration.smooth,
  },
} as const;

/**
 * Helper function to ensure animations don't exceed design system limits
 */
export function clampDuration(duration: number): number {
  return Math.min(duration, AnimationDuration.maximum);
}

/**
 * Helper to get timing config for reanimated
 */
export function getTimingConfig(duration: number = AnimationDuration.standard) {
  return {
    duration: clampDuration(duration),
  };
}

/**
 * Helper to get spring config for reanimated
 */
export function getSpringConfig(
  damping: number = 20,
  stiffness: number = 300,
  mass: number = 1
) {
  return {
    damping,
    stiffness,
    mass,
  };
}

