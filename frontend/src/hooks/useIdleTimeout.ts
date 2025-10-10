import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeoutMs?: number; // Time in milliseconds before auto-logout
  onIdle: () => void; // Callback when user is idle
  enabled?: boolean; // Whether idle timeout is enabled
}

/**
 * Hook that tracks user activity and triggers a callback after a period of inactivity
 * @param options Configuration options
 * @returns void
 */
export const useIdleTimeout = ({
  timeoutMs = 5 * 60 * 1000, // Default 5 minutes
  onIdle,
  enabled = true,
}: UseIdleTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Keep onIdle callback up to date
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ User idle timeout reached, signing out...');
      onIdleRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Start the timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer]);
};
