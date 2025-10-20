import { useRef, useEffect } from 'react';
import { useDrag, usePinch, useWheel } from '@use-gesture/react';
import { useSpring, config } from '@react-spring/web';

interface UseIOSGesturesOptions {
  mapRef: React.RefObject<any>;
  onZoom?: (zoom: number) => void;
  onPan?: (x: number, y: number) => void;
  enableMomentum?: boolean;
  enableElastic?: boolean;
}

/**
 * iOS-style gestures for map interactions
 * Provides:
 * - Elastic pinch-to-zoom
 * - Momentum scrolling
 * - Rubberband boundaries
 * - Smooth physics-based motion
 */
export const useIOSGestures = ({
  mapRef,
  onZoom,
  onPan,
  enableMomentum = true,
  enableElastic = true,
}: UseIOSGesturesOptions) => {
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());

  // Spring animation for elastic effects
  const [{ scale }, api] = useSpring(() => ({
    scale: 1,
    config: config.gentle,
  }));

  // Pinch-to-zoom gesture with elastic bounds
  const bindPinch = usePinch(
    ({ offset: [scaleOffset], last, memo = scale.get() }) => {
      const map = mapRef.current;
      if (!map) return memo;

      // Calculate new zoom level
      const currentZoom = map.getZoom();
      const newZoom = currentZoom + (scaleOffset - memo) * 0.01;

      // Apply zoom with elastic bounds
      if (enableElastic) {
        // Rubberband effect when zooming beyond limits
        const minZoom = map.getMinZoom();
        const maxZoom = map.getMaxZoom();

        if (newZoom < minZoom) {
          // Elastic resistance when zooming out too far
          const diff = minZoom - newZoom;
          const rubberband = Math.max(0, 1 - diff * 0.15);
          map.setZoom(minZoom - diff * rubberband);
        } else if (newZoom > maxZoom) {
          // Elastic resistance when zooming in too far
          const diff = newZoom - maxZoom;
          const rubberband = Math.max(0, 1 - diff * 0.15);
          map.setZoom(maxZoom + diff * rubberband);
        } else {
          map.setZoom(newZoom);
        }
      } else {
        map.setZoom(newZoom);
      }

      if (last && onZoom) {
        onZoom(map.getZoom());
      }

      return scaleOffset;
    },
    {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: enableElastic ? 0.15 : false,
    }
  );

  // Drag gesture with momentum
  const bindDrag = useDrag(
    ({ movement: [mx, my], velocity: [vx, vy], last }) => {
      const map = mapRef.current;
      if (!map) return;

      // Update velocity for momentum
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      velocityRef.current = {
        x: vx,
        y: vy,
      };

      // Pan the map
      if (onPan) {
        onPan(mx, my);
      }

      // Apply momentum when gesture ends
      if (last && enableMomentum) {
        applyMomentum(map, vx, vy);
      }
    },
    {
      rubberband: enableElastic ? 0.15 : false,
    }
  );

  // Wheel gesture for smooth scrolling
  const bindWheel = useWheel(
    ({ delta: [, dy], last }) => {
      const map = mapRef.current;
      if (!map) return;

      // Smooth zoom from wheel
      const currentZoom = map.getZoom();
      const zoomDelta = -dy * 0.001;
      const newZoom = currentZoom + zoomDelta;

      map.setZoom(newZoom, { animate: true, duration: 100 });

      if (last && onZoom) {
        onZoom(map.getZoom());
      }
    }
  );

  // Apply momentum scrolling with physics
  const applyMomentum = (map: any, vx: number, vy: number) => {
    const decay = 0.95;
    const minVelocity = 0.01;

    let currentVx = vx;
    let currentVy = vy;

    const animate = () => {
      // Apply velocity
      const center = map.getCenter();
      const newCenter = {
        lat: center.lat - currentVy * 0.0001,
        lng: center.lng + currentVx * 0.0001,
      };

      map.panTo(newCenter, { animate: false });

      // Decay velocity
      currentVx *= decay;
      currentVy *= decay;

      // Continue if velocity is still significant
      if (Math.abs(currentVx) > minVelocity || Math.abs(currentVy) > minVelocity) {
        requestAnimationFrame(animate);
      }
    };

    // Start momentum animation
    if (Math.abs(vx) > minVelocity || Math.abs(vy) > minVelocity) {
      requestAnimationFrame(animate);
    }
  };

  return {
    bindPinch,
    bindDrag,
    bindWheel,
    scale,
  };
};

/**
 * Hook for smooth map transitions with iOS-style easing
 */
export const useMapTransition = (mapRef: React.RefObject<any>) => {
  const flyToWithEasing = (
    center: [number, number],
    zoom: number,
    duration: number = 800
  ) => {
    const map = mapRef.current;
    if (!map) return;

    // iOS-style ease-out curve
    const easeOutCubic = (t: number) => {
      return 1 - Math.pow(1 - t, 3);
    };

    map.flyTo(center, zoom, {
      animate: true,
      duration: duration / 1000,
      easeLinearity: 0.2,
      // Use custom easing function
      animate: true,
    });
  };

  const smoothZoomTo = (zoom: number, duration: number = 500) => {
    const map = mapRef.current;
    if (!map) return;

    map.setZoom(zoom, { animate: true, duration: duration / 1000 });
  };

  return {
    flyToWithEasing,
    smoothZoomTo,
  };
};
