/**
 * Activity Tracker Utility
 * Tracks user interactions and sends them to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('activity_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('activity_session_id', sessionId);
  }
  return sessionId;
};

// Queue for batching activity logs
let activityQueue: any[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE = 10;
const BATCH_TIMEOUT_MS = 5000; // Send batch every 5 seconds

interface ActivityLogData {
  event_type: string;
  page_path?: string;
  element_type?: string;
  element_text?: string;
  element_id?: string;
  metadata?: Record<string, any>;
  user_id?: string;
  company_id?: string;
}

/**
 * Send activity logs to backend in batch
 */
const sendBatch = async () => {
  if (activityQueue.length === 0) return;

  const batch = [...activityQueue];
  activityQueue = [];

  try {
    await fetch(`${API_URL}/activity/log/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activities: batch
      })
    });
  } catch (error) {
    console.error('Failed to send activity logs:', error);
  }
};

/**
 * Log a user activity event
 */
export const logActivity = (data: ActivityLogData) => {
  const sessionId = getSessionId();
  const pagePath = data.page_path || window.location.pathname;

  const activity = {
    session_id: sessionId,
    event_type: data.event_type,
    page_path: pagePath,
    element_type: data.element_type,
    element_text: data.element_text,
    element_id: data.element_id,
    metadata: data.metadata || {},
    user_id: data.user_id,
    company_id: data.company_id,
  };

  activityQueue.push(activity);

  // If batch is full, send immediately
  if (activityQueue.length >= BATCH_SIZE) {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
    sendBatch();
  } else if (!batchTimeout) {
    // Otherwise, schedule a batch send
    batchTimeout = setTimeout(() => {
      sendBatch();
      batchTimeout = null;
    }, BATCH_TIMEOUT_MS);
  }
};

/**
 * Log a click event
 */
export const logClick = (element: HTMLElement, metadata?: Record<string, any>, userId?: string, companyId?: string) => {
  const elementType = element.tagName.toLowerCase();
  const elementText = element.textContent?.trim().substring(0, 100) || '';
  const elementId = element.id || element.getAttribute('data-track-id') || '';

  logActivity({
    event_type: 'click',
    element_type: elementType,
    element_text: elementText,
    element_id: elementId,
    metadata,
    user_id: userId,
    company_id: companyId,
  });
};

/**
 * Log a page view
 */
export const logPageView = (userId?: string, companyId?: string, metadata?: Record<string, any>) => {
  logActivity({
    event_type: 'page_view',
    metadata,
    user_id: userId,
    company_id: companyId,
  });
};

/**
 * Flush any pending activity logs (call on page unload)
 */
export const flushActivityLogs = () => {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }
  sendBatch();
};

// Flush logs on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushActivityLogs);
}
