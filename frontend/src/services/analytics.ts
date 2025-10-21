import { supabase } from '../lib/supabase';

interface AnalyticsEvent {
  eventType: string;
  eventCategory: 'navigation' | 'action' | 'conversion' | 'engagement' | 'error';
  eventName: string;
  eventData?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private batchSize = 5; // Send every 5 events
  private flushInterval = 10000; // Or every 10 seconds
  private intervalId?: NodeJS.Timeout;
  private userId: string | null = null;
  private companyId: string | null = null;
  private userEmail: string | null = null;
  private companyName: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();

    // Listen for page unload to flush remaining events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPeriodicFlush() {
    this.intervalId = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  // Set user context
  setUser(userId: string | null, companyId: string | null, email: string | null, companyName: string | null) {
    this.userId = userId;
    this.companyId = companyId;
    this.userEmail = email;
    this.companyName = companyName;
  }

  // Track any event
  track(event: AnalyticsEvent) {
    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  // Track page view
  trackPageView(pagePath: string, pageTitle?: string) {
    this.track({
      eventType: 'page_view',
      eventCategory: 'navigation',
      eventName: `Page View: ${pagePath}`,
      eventData: {
        page_title: pageTitle || document.title,
        referrer: document.referrer
      }
    });
  }

  // Track button/element click
  trackClick(elementName: string, elementType: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'click',
      eventCategory: 'engagement',
      eventName: `Click: ${elementName}`,
      eventData: {
        element_type: elementType,
        ...metadata
      }
    });
  }

  // Track chapter view
  trackChapterView(chapterId: string, chapterName: string, universityName: string) {
    this.track({
      eventType: 'chapter_view',
      eventCategory: 'engagement',
      eventName: `Chapter Viewed: ${chapterName}`,
      eventData: {
        chapter_id: chapterId,
        chapter_name: chapterName,
        university_name: universityName
      }
    });
  }

  // Track chapter unlock
  trackChapterUnlock(chapterId: string, chapterName: string, cost: number) {
    this.track({
      eventType: 'chapter_unlock',
      eventCategory: 'conversion',
      eventName: `Chapter Unlocked: ${chapterName}`,
      eventData: {
        chapter_id: chapterId,
        chapter_name: chapterName,
        cost: cost
      }
    });
  }

  // Track credit purchase
  trackCreditPurchase(amount: number, credits: number, packageName: string) {
    this.track({
      eventType: 'credit_purchase',
      eventCategory: 'conversion',
      eventName: `Credits Purchased: ${packageName}`,
      eventData: {
        amount: amount,
        credits: credits,
        package_name: packageName
      }
    });
  }

  // Track subscription
  trackSubscription(tier: string, price: number, isNew: boolean) {
    this.track({
      eventType: 'subscription',
      eventCategory: 'conversion',
      eventName: isNew ? `Subscription Started: ${tier}` : `Subscription Changed: ${tier}`,
      eventData: {
        tier: tier,
        price: price,
        is_new: isNew
      }
    });
  }

  // Track search
  trackSearch(query: string, resultsCount: number) {
    this.track({
      eventType: 'search',
      eventCategory: 'engagement',
      eventName: `Search: ${query}`,
      eventData: {
        query: query,
        results_count: resultsCount
      }
    });
  }

  // Track filter usage
  trackFilter(filterType: string, filterValue: string | number) {
    this.track({
      eventType: 'filter',
      eventCategory: 'engagement',
      eventName: `Filter Applied: ${filterType}`,
      eventData: {
        filter_type: filterType,
        filter_value: filterValue
      }
    });
  }

  // Track map interaction
  trackMapClick(lat: number, lng: number, chapterName?: string) {
    this.track({
      eventType: 'map_click',
      eventCategory: 'engagement',
      eventName: chapterName ? `Map: ${chapterName}` : 'Map Click',
      eventData: {
        latitude: lat,
        longitude: lng,
        chapter_name: chapterName
      }
    });
  }

  // Track form submission
  trackFormSubmit(formName: string, success: boolean, errorMessage?: string) {
    this.track({
      eventType: 'form_submit',
      eventCategory: success ? 'action' : 'error',
      eventName: `Form: ${formName}`,
      eventData: {
        form_name: formName,
        success: success,
        error_message: errorMessage
      }
    });
  }

  // Track team invite
  trackTeamInvite(inviteeEmail: string, role: string) {
    this.track({
      eventType: 'team_invite',
      eventCategory: 'action',
      eventName: `Team Member Invited`,
      eventData: {
        invitee_email: inviteeEmail,
        role: role
      }
    });
  }

  // Track error
  trackError(errorType: string, errorMessage: string, context?: Record<string, any>) {
    this.track({
      eventType: 'error',
      eventCategory: 'error',
      eventName: `Error: ${errorType}`,
      eventData: {
        error_type: errorType,
        error_message: errorMessage,
        ...context
      }
    });
  }

  // Flush events to database
  private async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const events = eventsToSend.map(event => ({
        user_id: this.userId,
        company_id: this.companyId,
        session_id: this.sessionId,
        event_type: event.eventType,
        event_category: event.eventCategory,
        event_name: event.eventName,
        event_data: event.eventData || {},
        page_url: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer,
        user_email: this.userEmail,
        company_name: this.companyName
      }));

      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) {
        console.error('Analytics error:', error);
        // Re-queue on failure
        this.queue.push(...eventsToSend);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-queue on failure
      this.queue.push(...eventsToSend);
    }
  }

  // Cleanup
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
