// Animation constants and shared configurations
// All durations in milliseconds

export const DURATIONS = {
  fast: 200,
  normal: 400,
  slow: 600,
  verySlow: 1200,
  tickertape: 120000, // 2 minutes for full scroll cycle (very slow)
} as const;

export const EASINGS = {
  easeOut: 'easeOutCubic',
  easeIn: 'easeInCubic',
  easeInOut: 'easeInOutCubic',
  easeOutBack: 'easeOutBack',
  easeInOutBack: 'easeInOutBack',
  spring: [0.4, 0.0, 0.2, 1], // Custom bezier for spring-like effect
  linear: 'linear',
} as const;

export const STAGGER_DELAYS = {
  fast: 50,
  normal: 80,
  slow: 100,
} as const;

// Spring physics presets
export const SPRING_PRESETS = {
  gentle: {
    stiffness: 200,
    damping: 15,
  },
  normal: {
    stiffness: 300,
    damping: 20,
  },
  bouncy: {
    stiffness: 400,
    damping: 10,
  },
} as const;

// Respect user's motion preferences for accessibility
export const shouldAnimate = (): boolean => {
  if (typeof window === 'undefined') return true;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper to get animation duration (returns 0 if motion is reduced)
export const getAnimationDuration = (duration: number): number => {
  return shouldAnimate() ? duration : 0;
};
