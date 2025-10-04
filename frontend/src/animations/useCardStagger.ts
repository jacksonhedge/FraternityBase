import { useEffect, useRef } from 'react';
import { animate, set } from 'animejs';
import { DURATIONS, EASINGS, STAGGER_DELAYS, shouldAnimate } from './constants';

/**
 * Hook for staggered card entrance animations
 * Cards fade in and slide up with a slight delay between each
 */
export const useCardStagger = (dependencies: any[] = []) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current || !shouldAnimate()) return;

    const cards = containerRef.current.querySelectorAll('[data-animate-card]');
    if (cards.length === 0) return;

    // Set initial state
    set(cards, {
      opacity: 0,
      translateY: 30,
    });

    // Animate in with stagger
    animationRef.current = animate(cards, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: DURATIONS.slow,
      ease: EASINGS.easeOut,
      delay: (el: any, i: number) => i * STAGGER_DELAYS.normal,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, dependencies);

  return containerRef;
};
