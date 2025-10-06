/**
 * useActivityTracking Hook
 * React hook for tracking user interactions
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logActivity, logClick, logPageView } from '../utils/activityTracker';

export const useActivityTracking = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.auth);

  const userId = user?.id;
  const companyId = profile?.company_id;

  // Log page views
  useEffect(() => {
    logPageView(userId, companyId, {
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search, userId, companyId]);

  // Track click with metadata
  const trackClick = useCallback((
    element: HTMLElement | string,
    metadata?: Record<string, any>
  ) => {
    if (typeof element === 'string') {
      // If passed a string, create a synthetic log
      logActivity({
        event_type: 'click',
        element_text: element,
        metadata,
        user_id: userId,
        company_id: companyId,
      });
    } else {
      logClick(element, metadata, userId, companyId);
    }
  }, [userId, companyId]);

  // Track custom event
  const trackEvent = useCallback((
    eventType: string,
    metadata?: Record<string, any>
  ) => {
    logActivity({
      event_type: eventType,
      metadata,
      user_id: userId,
      company_id: companyId,
    });
  }, [userId, companyId]);

  // Track chapter view
  const trackChapterView = useCallback((chapterId: string, chapterName: string) => {
    logActivity({
      event_type: 'chapter_view',
      metadata: {
        chapter_id: chapterId,
        chapter_name: chapterName,
      },
      user_id: userId,
      company_id: companyId,
    });
  }, [userId, companyId]);

  // Track chapter unlock
  const trackChapterUnlock = useCallback((chapterId: string, chapterName: string, cost: number) => {
    logActivity({
      event_type: 'chapter_unlock',
      metadata: {
        chapter_id: chapterId,
        chapter_name: chapterName,
        cost_credits: cost,
      },
      user_id: userId,
      company_id: companyId,
    });
  }, [userId, companyId]);

  // Track search
  const trackSearch = useCallback((query: string, results: number) => {
    logActivity({
      event_type: 'search',
      metadata: {
        search_query: query,
        results_count: results,
      },
      user_id: userId,
      company_id: companyId,
    });
  }, [userId, companyId]);

  return {
    trackClick,
    trackEvent,
    trackChapterView,
    trackChapterUnlock,
    trackSearch,
  };
};
