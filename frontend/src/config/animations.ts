// 🎯 iOS-Style Animation Configs
// Based on Apple's design guidelines and motion principles

export const SPRING_CONFIGS = {
  // Default iOS spring - smooth and natural
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },

  // Snappy response - for buttons and quick interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.6,
  },

  // Gentle bounce - for large elements like sidebars
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 35,
    mass: 1.0,
  },

  // Elastic - for drag and pinch gestures
  elastic: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
    mass: 0.9,
    velocity: 0,
  },

  // Wobbly - for playful interactions
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 15,
    mass: 1.2,
  },
};

// Easing functions - iOS-style curves
export const EASINGS = {
  // iOS standard ease
  easeInOut: [0.4, 0.0, 0.2, 1],

  // Accelerate then decelerate (most common)
  easeOut: [0.0, 0.0, 0.2, 1],

  // Sharp acceleration at start
  easeIn: [0.4, 0.0, 1, 1],

  // Quick snap
  sharp: [0.4, 0.0, 0.6, 1],
};

// Duration constants (in ms)
export const DURATIONS = {
  instant: 0,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Gesture configuration
export const GESTURE_CONFIG = {
  // Pinch-to-zoom
  pinch: {
    scaleBounds: { min: 0.5, max: 3 },
    rubberband: 0.15, // iOS elastic resistance
  },

  // Drag/pan
  drag: {
    rubberband: 0.15,
    bounds: { left: -100, right: 100, top: -100, bottom: 100 },
    axis: undefined, // Allow both x and y
  },

  // Momentum scrolling
  momentum: {
    decay: 0.95,
    minVelocity: 0.01,
    maxVelocity: 50,
  },
};

// Stagger animation - for lists of items
export const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      ...SPRING_CONFIGS.default,
    },
  }),
};

// Fade in/out
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: SPRING_CONFIGS.gentle,
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATIONS.fast / 1000 },
  },
};

// Slide from bottom (iOS sheet style)
export const slideUpVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: SPRING_CONFIGS.default,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: SPRING_CONFIGS.snappy,
  },
};

// Scale animation (for buttons)
export const scaleVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: SPRING_CONFIGS.snappy },
  tap: { scale: 0.95, transition: SPRING_CONFIGS.snappy },
};

// iOS-style page transition
export const pageTransitionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIGS.default,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: SPRING_CONFIGS.snappy,
  },
};
