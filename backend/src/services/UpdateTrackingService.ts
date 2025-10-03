/**
 * Update Tracking Service
 * Manages database update logs and partner notifications for FraternityBase
 */

import { createClient } from '@supabase/supabase-js';

interface DatabaseUpdate {
  id: string;
  update_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  change_summary: string;
  change_details: any;
  university_id?: string;
  university_name?: string;
  university_state?: string;
  chapter_id?: string;
  chapter_name?: string;
  created_by: string;
  is_major_update: boolean;
  created_at: Date;
}

interface PartnerSubscription {
  id: string;
  company_id: string;
  email: string;
  notification_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  is_active: boolean;
  notify_new_colleges: boolean;
  notify_new_chapters: boolean;
  notify_chapter_updates: boolean;
  notify_contact_info_updates: boolean;
  notify_officer_changes: boolean;
  notify_event_opportunities: boolean;
  interested_universities?: string[];
  interested_states?: string[];
  interested_org_types?: string[];
  last_notification_sent?: Date;
}

interface NotificationDigest {
  partner_subscription_id: string;
  company_id: string;
  email: string;
  digest_period_start: Date;
  digest_period_end: Date;
  update_ids: string[];
  update_count: number;
  subject: string;
  html_body: string;
  text_body: string;
  scheduled_send_time: Date;
}

export class UpdateTrackingService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Subscribe a partner to database updates
   */
  async subscribePartner(subscription: Omit<PartnerSubscription, 'id' | 'last_notification_sent'>): Promise<PartnerSubscription> {
    const { data, error } = await this.supabase
      .from('partner_subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update partner subscription preferences
   */
  async updateSubscription(subscriptionId: string, updates: Partial<PartnerSubscription>): Promise<PartnerSubscription> {
    const { data, error } = await this.supabase
      .from('partner_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all active subscriptions for a specific frequency
   */
  async getActiveSubscriptions(frequency: string): Promise<PartnerSubscription[]> {
    const { data, error } = await this.supabase
      .from('partner_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('notification_frequency', frequency);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get updates for a partner based on their preferences
   */
  async getUpdatesForPartner(
    subscription: PartnerSubscription,
    sinceDate: Date,
    untilDate: Date = new Date()
  ): Promise<DatabaseUpdate[]> {
    let query = this.supabase
      .from('database_updates')
      .select('*')
      .gte('created_at', sinceDate.toISOString())
      .lte('created_at', untilDate.toISOString())
      .order('created_at', { ascending: false });

    // Filter by update types based on preferences
    const allowedTypes: string[] = [];
    if (subscription.notify_new_colleges) allowedTypes.push('new_college');
    if (subscription.notify_new_chapters) allowedTypes.push('new_chapter');
    if (subscription.notify_chapter_updates) allowedTypes.push('chapter_update');
    if (subscription.notify_contact_info_updates) allowedTypes.push('contact_info');
    if (subscription.notify_officer_changes) allowedTypes.push('officer_change');
    if (subscription.notify_event_opportunities) allowedTypes.push('event_opportunity');

    if (allowedTypes.length > 0) {
      query = query.in('update_type', allowedTypes);
    }

    // Filter by states if specified
    if (subscription.interested_states && subscription.interested_states.length > 0) {
      query = query.in('university_state', subscription.interested_states);
    }

    // Filter by universities if specified
    if (subscription.interested_universities && subscription.interested_universities.length > 0) {
      query = query.in('university_id', subscription.interested_universities);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate notification digest for a partner
   */
  async generateDigest(
    subscription: PartnerSubscription,
    updates: DatabaseUpdate[]
  ): Promise<NotificationDigest> {
    const now = new Date();
    const periodStart = this.calculatePeriodStart(subscription.notification_frequency);

    // Group updates by type
    const updatesByType = this.groupUpdatesByType(updates);

    // Generate email content
    const subject = this.generateSubject(subscription.notification_frequency, updates.length);
    const htmlBody = this.generateHtmlBody(subscription, updatesByType);
    const textBody = this.generateTextBody(subscription, updatesByType);

    const digest: NotificationDigest = {
      partner_subscription_id: subscription.id,
      company_id: subscription.company_id,
      email: subscription.email,
      digest_period_start: periodStart,
      digest_period_end: now,
      update_ids: updates.map(u => u.id),
      update_count: updates.length,
      subject,
      html_body: htmlBody,
      text_body: textBody,
      scheduled_send_time: now
    };

    return digest;
  }

  /**
   * Queue notification for sending
   */
  async queueNotification(digest: NotificationDigest): Promise<void> {
    const { error } = await this.supabase
      .from('notification_queue')
      .insert([{
        ...digest,
        status: 'pending'
      }]);

    if (error) throw error;

    // Update last_notification_sent on subscription
    await this.supabase
      .from('partner_subscriptions')
      .update({ last_notification_sent: new Date().toISOString() })
      .eq('id', digest.partner_subscription_id);
  }

  /**
   * Process all pending notifications (called by cron job)
   */
  async processNotifications(frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'): Promise<number> {
    console.log(`Processing ${frequency} notifications...`);

    const subscriptions = await this.getActiveSubscriptions(frequency);
    let processedCount = 0;

    for (const subscription of subscriptions) {
      try {
        const periodStart = this.calculatePeriodStart(frequency);
        const updates = await this.getUpdatesForPartner(subscription, periodStart);

        if (updates.length > 0) {
          const digest = await this.generateDigest(subscription, updates);
          await this.queueNotification(digest);
          processedCount++;
          console.log(`Queued digest for ${subscription.email}: ${updates.length} updates`);
        } else {
          console.log(`No updates for ${subscription.email} since ${periodStart}`);
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
      }
    }

    console.log(`Processed ${processedCount} notifications for ${frequency} frequency`);
    return processedCount;
  }

  /**
   * Get pending notifications ready to send
   */
  async getPendingNotifications(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_send_time', new Date().toISOString())
      .order('scheduled_send_time', { ascending: true })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  /**
   * Mark notification as sent
   */
  async markNotificationSent(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Mark notification as failed
   */
  async markNotificationFailed(notificationId: string, errorMessage: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_queue')
      .update({
        status: 'failed',
        error_message: errorMessage
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Log a manual database update (not auto-triggered)
   */
  async logUpdate(update: Omit<DatabaseUpdate, 'id' | 'created_at'>): Promise<DatabaseUpdate> {
    const { data, error } = await this.supabase
      .from('database_updates')
      .insert([update])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get recent updates (for admin dashboard)
   */
  async getRecentUpdates(limit: number = 50, offset: number = 0): Promise<DatabaseUpdate[]> {
    const { data, error } = await this.supabase
      .from('database_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get update statistics for a time period
   */
  async getUpdateStats(startDate: Date, endDate: Date = new Date()): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('database_updates')
      .select('update_type')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const stats: Record<string, number> = {};
    data?.forEach((update: any) => {
      stats[update.update_type] = (stats[update.update_type] || 0) + 1;
    });

    return stats;
  }

  // Helper methods

  private calculatePeriodStart(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'biweekly':
        return new Date(now.setDate(now.getDate() - 14));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  private groupUpdatesByType(updates: DatabaseUpdate[]): Record<string, DatabaseUpdate[]> {
    return updates.reduce((acc, update) => {
      if (!acc[update.update_type]) {
        acc[update.update_type] = [];
      }
      acc[update.update_type].push(update);
      return acc;
    }, {} as Record<string, DatabaseUpdate[]>);
  }

  private generateSubject(frequency: string, updateCount: number): string {
    const period = frequency === 'daily' ? 'Today' :
                   frequency === 'weekly' ? 'This Week' :
                   frequency === 'biweekly' ? 'Last 2 Weeks' :
                   'This Month';

    return `FraternityBase Updates: ${updateCount} New ${updateCount === 1 ? 'Update' : 'Updates'} ${period}`;
  }

  private generateHtmlBody(subscription: PartnerSubscription, updatesByType: Record<string, DatabaseUpdate[]>): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #1e3a8a; }
    .update-item { margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; }
    .update-title { font-weight: bold; color: #1e3a8a; }
    .update-details { margin-top: 5px; font-size: 14px; color: #666; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .cta-button { display: inline-block; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FraternityBase Updates</h1>
      <p>Your ${subscription.notification_frequency} digest</p>
    </div>
`;

    const typeLabels: Record<string, string> = {
      'new_college': '🎓 New Colleges Added',
      'new_chapter': '🏛️ New Chapters Added',
      'contact_info': '📧 Contact Info Updated',
      'officer_change': '👥 Officer Changes',
      'warm_intro': '🤝 Warm Introduction Opportunities'
    };

    Object.entries(updatesByType).forEach(([type, updates]) => {
      html += `
    <div class="section">
      <h2>${typeLabels[type] || type}</h2>
`;
      updates.forEach(update => {
        html += `
      <div class="update-item">
        <div class="update-title">${update.change_summary}</div>
        <div class="update-details">
          ${update.university_name ? `📍 ${update.university_name}` : ''}
          ${update.university_state ? ` (${update.university_state})` : ''}
        </div>
      </div>
`;
      });
      html += `
    </div>
`;
    });

    html += `
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://fraternitybase.com/dashboard" class="cta-button">View Full Details on FraternityBase</a>
    </div>

    <div class="footer">
      <p>This is your ${subscription.notification_frequency} update digest from FraternityBase.</p>
      <p><a href="https://fraternitybase.com/preferences">Update your notification preferences</a></p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  private generateTextBody(subscription: PartnerSubscription, updatesByType: Record<string, DatabaseUpdate[]>): string {
    let text = `FRATERNITYBASE UPDATES\n`;
    text += `Your ${subscription.notification_frequency} digest\n`;
    text += `${'='.repeat(50)}\n\n`;

    const typeLabels: Record<string, string> = {
      'new_college': 'NEW COLLEGES ADDED',
      'new_chapter': 'NEW CHAPTERS ADDED',
      'contact_info': 'CONTACT INFO UPDATED',
      'officer_change': 'OFFICER CHANGES',
      'warm_intro': 'WARM INTRODUCTION OPPORTUNITIES'
    };

    Object.entries(updatesByType).forEach(([type, updates]) => {
      text += `${typeLabels[type] || type}\n`;
      text += `${'-'.repeat(50)}\n`;

      updates.forEach(update => {
        text += `• ${update.change_summary}\n`;
        if (update.university_name) {
          text += `  Location: ${update.university_name}`;
          if (update.university_state) text += ` (${update.university_state})`;
          text += `\n`;
        }
        text += `\n`;
      });
      text += `\n`;
    });

    text += `View full details: https://fraternitybase.com/dashboard\n\n`;
    text += `Manage preferences: https://fraternitybase.com/preferences\n`;

    return text;
  }
}

export default UpdateTrackingService;
