import { useEffect } from 'react';
import { animate, set } from 'animejs';
import { DURATIONS, EASINGS, shouldAnimate } from './constants';

/**
 * Hook for map-specific animations
 * - State label fade-ins
 * - Sidebar slide animations
 * - Marker pulse effects
 */

export const useStateLabels = (statesData: any) => {
  useEffect(() => {
    if (!shouldAnimate() || !statesData) return;

    const labels = document.querySelectorAll('.state-label');
    if (labels.length === 0) return;

    // Set initial state
    set(labels, {
      opacity: 0,
      scale: 0.8,
    });

    // Animate in with stagger
    animate(labels, {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: DURATIONS.slow,
      ease: EASINGS.easeOut,
      delay: (el: any, i: number) => i * 30, // Stagger by 30ms
    });
  }, [statesData]);
};

export const useSidebarSlide = (isOpen: boolean, sidebarRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!shouldAnimate() || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;

    if (isOpen) {
      // Slide in from right
      set(sidebar, {
        translateX: 100,
        opacity: 0,
      });

      animate(sidebar, {
        translateX: [100, 0],
        opacity: [0, 1],
        duration: DURATIONS.normal,
        ease: EASINGS.easeOut,
      });
    } else {
      // Slide out to right
      animate(sidebar, {
        translateX: [0, 100],
        opacity: [1, 0],
        duration: DURATIONS.normal,
        ease: EASINGS.easeIn,
      });
    }
  }, [isOpen, sidebarRef]);
};

export const useMarkerPulse = (markerElements: NodeListOf<Element>) => {
  useEffect(() => {
    if (!shouldAnimate() || markerElements.length === 0) return;

    // Subtle pulse animation for markers
    const animation = animate(markerElements, {
      scale: [1, 1.1, 1],
      duration: DURATIONS.verySlow,
      ease: EASINGS.easeInOut,
      loop: true,
    });

    return () => {
      animation.pause();
    };
  }, [markerElements]);
};
