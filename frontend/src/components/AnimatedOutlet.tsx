import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { animate, set } from 'animejs';
import { DURATIONS, EASINGS, shouldAnimate } from '../animations/constants';

/**
 * Wrapper for React Router's Outlet with page transition animations
 * Provides smooth fade and slide transitions when navigating between routes
 */
const AnimatedOutlet = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    if (!containerRef.current || !shouldAnimate()) return;

    // Only animate if the route actually changed
    if (previousLocation.current === location.pathname) return;

    const container = containerRef.current;

    // Set initial state (hidden)
    set(container, {
      opacity: 0,
      translateY: 20,
    });

    // Animate in
    animate(container, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    });

    // Update previous location
    previousLocation.current = location.pathname;
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className="page-container"
      style={{ willChange: shouldAnimate() ? 'transform, opacity' : 'auto' }}
    >
      <Outlet />
    </div>
  );
};

export default AnimatedOutlet;
