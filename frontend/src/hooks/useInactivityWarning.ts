import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface UseInactivityWarningOptions {
  warningTime?: number; // Time before showing warning (ms)
  logoutTime?: number; // Additional time before auto-logout after warning (ms)
  onWarning?: () => void;
  onLogout?: () => void;
}

export const useInactivityWarning = ({
  warningTime = 15 * 60 * 1000, // 15 minutes of inactivity
  logoutTime = 2 * 60 * 1000, // 2 minutes warning period
  onWarning,
  onLogout,
}: UseInactivityWarningOptions = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    console.log('🚪 Auto-logout due to inactivity');
    clearAllTimers();
    setShowWarning(false);
    dispatch(logout());
    onLogout?.();
    navigate('/login');
  }, [dispatch, navigate, clearAllTimers, onLogout]);

  const startCountdown = useCallback(() => {
    setTimeLeft(logoutTime);

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          handleLogout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  }, [logoutTime, handleLogout]);

  const showWarningModal = useCallback(() => {
    console.log('⚠️ Showing inactivity warning');
    setShowWarning(true);
    onWarning?.();

    startCountdown();

    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, logoutTime);
  }, [logoutTime, handleLogout, startCountdown, onWarning]);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      showWarningModal();
    }, warningTime);
  }, [warningTime, showWarningModal, clearAllTimers]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only reset if more than 1 second has passed (avoid too many resets)
    if (timeSinceLastActivity > 1000) {
      if (!showWarning) {
        resetTimers();
      }
    }
  }, [showWarning, resetTimers]);

  const handleStayLoggedIn = useCallback(() => {
    console.log('✅ User chose to stay logged in');
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timers
    resetTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [handleActivity, resetTimers, clearAllTimers]);

  return {
    showWarning,
    timeLeft,
    handleStayLoggedIn,
    handleLogout,
  };
};
