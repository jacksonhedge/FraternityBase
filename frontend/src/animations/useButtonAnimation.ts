import { useRef, useCallback } from 'react';
import { animate } from 'animejs';
import { DURATIONS, EASINGS, shouldAnimate } from './constants';

/**
 * Reusable hook for button hover animations
 * Adds subtle scale and shadow effects on hover
 */
export const useButtonAnimation = () => {
  const elementRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<any | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (!elementRef.current || !shouldAnimate()) return;

    // Cancel any ongoing animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    animationRef.current = animate(elementRef.current, {
      scale: 1.03,
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current || !shouldAnimate()) return;

    // Cancel any ongoing animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    animationRef.current = animate(elementRef.current, {
      scale: 1,
      duration: DURATIONS.fast,
      ease: EASINGS.easeOut,
    });
  }, []);

  return {
    ref: elementRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
};
