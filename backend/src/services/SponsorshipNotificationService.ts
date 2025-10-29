/**
 * Sponsorship Notification Service
 * Sends daily/weekly email digest notifications to companies about new sponsorship opportunities
 * from fraternities looking for brand partnerships
 */

import { Resend } from 'resend';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SponsorshipOpportunity {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  opportunity_type: string;
  target_industries: string[];
  geographic_scope: string;
  budget_needed: number;
  budget_range: string;
  event_date: string;
  application_deadline: string;
  timeline_description: string;
  expected_reach: number;
  deliverables: string[];
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  posted_at: string;
  expires_at: string;

  // Joined fields
  chapter_name?: string;
  university_name?: string;
  greek_org_name?: string;
  university_state?: string;
  chapter_instagram?: string;
  chapter_member_count?: number;
  chapter_grade?: number;
}

interface CompanyNotificationPreferences {
  company_id: string;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  send_time_utc: number;
  target_states: string[];
  target_organizations: string[];
  target_universities: string[];
  interested_opportunity_types: string[];
  excluded_opportunity_types: string[];
  min_budget_range: number;
  max_budget_range: number;
  preferred_geographic_scope: string[];
  min_expected_reach: number;
  receive_featured_opportunities: boolean;
  receive_urgent_alerts: boolean;
  unsubscribed_at: string | null;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  email?: string;
  contact_name?: string;
}

export class SponsorshipNotificationService {
  private resend: Resend;
  private supabase: SupabaseClient;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(
    resendApiKey: string,
    supabaseUrl: string,
    supabaseKey: string,
    fromEmail: string = 'sponsorships@fraternitybase.com',
    frontendUrl: string = 'https://fraternitybase.com'
  ) {
    this.resend = new Resend(resendApiKey);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.fromEmail = fromEmail;
    this.frontendUrl = frontendUrl;
  }

  /**
   * Send daily digest emails to all companies with 'daily' frequency
   */
  async sendDailyDigests(): Promise<void> {
    console.log('🌅 Starting daily sponsorship digest email job...');

    try {
      // Get all companies with daily frequency preference (not unsubscribed)
      const { data: companies, error: companiesError } = await this.supabase
        .from('sponsorship_notification_preferences')
        .select(`
          *,
          companies (
            id,
            name,
            industry
          )
        `)
        .eq('email_frequency', 'daily')
        .is('unsubscribed_at', null);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        return;
      }

      if (!companies || companies.length === 0) {
        console.log('ℹ️ No companies with daily email preference');
        return;
      }

      console.log(`📬 Sending daily digests to ${companies.length} companies...`);

      // Get opportunities from the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      for (const companyPrefs of companies) {
        const company = (companyPrefs as any).companies;

        if (!company) continue;

        try {
          // Get matching opportunities for this company
          const opportunities = await this.getMatchingOpportunities(
            companyPrefs as any,
            twentyFourHoursAgo
          );

          if (opportunities.length > 0) {
            await this.sendDigestEmail(
              company,
              companyPrefs as any,
              opportunities,
              'daily_digest'
            );
            console.log(`✅ Sent daily digest to ${company.name} (${opportunities.length} opportunities)`);
          } else {
            console.log(`ℹ️ No matching opportunities for ${company.name}`);
          }

          // Rate limiting: wait 100ms between emails to avoid hitting Resend limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error sending digest to ${company.name}:`, error);
          // Continue with next company
        }
      }

      console.log('✅ Daily digest job completed');
    } catch (error) {
      console.error('❌ Error in daily digest job:', error);
      throw error;
    }
  }

  /**
   * Send weekly digest emails to all companies with 'weekly' frequency
   */
  async sendWeeklyDigests(): Promise<void> {
    console.log('📅 Starting weekly sponsorship digest email job...');

    try {
      // Get all companies with weekly frequency preference (not unsubscribed)
      const { data: companies, error: companiesError } = await this.supabase
        .from('sponsorship_notification_preferences')
        .select(`
          *,
          companies (
            id,
            name,
            industry
          )
        `)
        .eq('email_frequency', 'weekly')
        .is('unsubscribed_at', null);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        return;
      }

      if (!companies || companies.length === 0) {
        console.log('ℹ️ No companies with weekly email preference');
        return;
      }

      console.log(`📬 Sending weekly digests to ${companies.length} companies...`);

      // Get opportunities from the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      for (const companyPrefs of companies) {
        const company = (companyPrefs as any).companies;

        if (!company) continue;

        try {
          // Get matching opportunities for this company
          const opportunities = await this.getMatchingOpportunities(
            companyPrefs as any,
            sevenDaysAgo
          );

          if (opportunities.length > 0) {
            await this.sendDigestEmail(
              company,
              companyPrefs as any,
              opportunities,
              'weekly_digest'
            );
            console.log(`✅ Sent weekly digest to ${company.name} (${opportunities.length} opportunities)`);
          } else {
            console.log(`ℹ️ No matching opportunities for ${company.name}`);
          }

          // Rate limiting: wait 100ms between emails
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error sending digest to ${company.name}:`, error);
          // Continue with next company
        }
      }

      console.log('✅ Weekly digest job completed');
    } catch (error) {
      console.error('❌ Error in weekly digest job:', error);
      throw error;
    }
  }

  /**
   * Send immediate notification for urgent/featured opportunities
   */
  async sendImmediateNotification(opportunityId: string): Promise<void> {
    console.log(`🚨 Sending immediate notification for opportunity ${opportunityId}...`);

    try {
      // Get the opportunity details
      const { data: opportunity, error: oppError } = await this.supabase
        .from('sponsorship_opportunities')
        .select(`
          *,
          chapters (
            id,
            chapter_name,
            member_count,
            grade,
            instagram_handle,
            universities (
              name,
              state
            ),
            greek_organizations (
              name
            )
          )
        `)
        .eq('id', opportunityId)
        .single();

      if (oppError || !opportunity) {
        console.error('Error fetching opportunity:', oppError);
        return;
      }

      // Only send immediate notifications for urgent opportunities
      if (!opportunity.is_urgent) {
        console.log('ℹ️ Opportunity is not marked as urgent, skipping immediate notification');
        return;
      }

      // Get all companies with immediate preference or those who receive urgent alerts
      const { data: companies, error: companiesError } = await this.supabase
        .from('sponsorship_notification_preferences')
        .select(`
          *,
          companies (
            id,
            name,
            industry
          )
        `)
        .or('email_frequency.eq.immediate,receive_urgent_alerts.eq.true')
        .is('unsubscribed_at', null);

      if (companiesError || !companies || companies.length === 0) {
        console.log('ℹ️ No companies with immediate notification preference');
        return;
      }

      console.log(`📬 Sending immediate alert to ${companies.length} companies...`);

      // Format opportunity data
      const chapter = (opportunity as any).chapters;
      const formattedOpportunity: SponsorshipOpportunity = {
        ...opportunity,
        chapter_name: chapter?.chapter_name,
        university_name: chapter?.universities?.name,
        greek_org_name: chapter?.greek_organizations?.name,
        university_state: chapter?.universities?.state,
        chapter_instagram: chapter?.instagram_handle,
        chapter_member_count: chapter?.member_count,
        chapter_grade: chapter?.grade
      };

      for (const companyPrefs of companies) {
        const company = (companyPrefs as any).companies;

        if (!company) continue;

        try {
          // Check if this opportunity matches company preferences
          if (this.doesOpportunityMatchPreferences(formattedOpportunity, companyPrefs as any)) {
            await this.sendDigestEmail(
              company,
              companyPrefs as any,
              [formattedOpportunity],
              'immediate_alert'
            );
            console.log(`✅ Sent immediate alert to ${company.name}`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error sending alert to ${company.name}:`, error);
        }
      }

      console.log('✅ Immediate notification job completed');
    } catch (error) {
      console.error('❌ Error in immediate notification:', error);
      throw error;
    }
  }

  /**
   * Get matching opportunities for a company based on their preferences
   */
  private async getMatchingOpportunities(
    preferences: CompanyNotificationPreferences,
    since: string
  ): Promise<SponsorshipOpportunity[]> {
    let query = this.supabase
      .from('sponsorship_opportunities')
      .select(`
        *,
        chapters (
          id,
          chapter_name,
          member_count,
          grade,
          instagram_handle,
          universities (
            name,
            state
          ),
          greek_organizations (
            name
          )
        )
      `)
      .eq('status', 'active')
      .gte('posted_at', since)
      .order('posted_at', { ascending: false });

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }

    if (!opportunities || opportunities.length === 0) {
      return [];
    }

    // Filter opportunities based on preferences
    const filtered = opportunities.filter((opp: any) => {
      const chapter = opp.chapters;
      const formattedOpp: SponsorshipOpportunity = {
        ...opp,
        chapter_name: chapter?.chapter_name,
        university_name: chapter?.universities?.name,
        greek_org_name: chapter?.greek_organizations?.name,
        university_state: chapter?.universities?.state,
        chapter_instagram: chapter?.instagram_handle,
        chapter_member_count: chapter?.member_count,
        chapter_grade: chapter?.grade
      };

      return this.doesOpportunityMatchPreferences(formattedOpp, preferences);
    });

    // Sort featured opportunities first
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    return filtered;
  }

  /**
   * Check if an opportunity matches company preferences
   */
  private doesOpportunityMatchPreferences(
    opportunity: SponsorshipOpportunity,
    preferences: CompanyNotificationPreferences
  ): boolean {
    // Check excluded opportunity types
    if (
      preferences.excluded_opportunity_types &&
      preferences.excluded_opportunity_types.includes(opportunity.opportunity_type)
    ) {
      return false;
    }

    // Check interested opportunity types (if specified)
    if (
      preferences.interested_opportunity_types &&
      preferences.interested_opportunity_types.length > 0 &&
      !preferences.interested_opportunity_types.includes(opportunity.opportunity_type)
    ) {
      return false;
    }

    // Check target states (if specified)
    if (
      preferences.target_states &&
      preferences.target_states.length > 0 &&
      opportunity.university_state &&
      !preferences.target_states.includes(opportunity.university_state)
    ) {
      return false;
    }

    // Check target organizations (if specified)
    if (
      preferences.target_organizations &&
      preferences.target_organizations.length > 0 &&
      opportunity.greek_org_name &&
      !preferences.target_organizations.includes(opportunity.greek_org_name)
    ) {
      return false;
    }

    // Check budget range (if specified)
    if (preferences.min_budget_range && opportunity.budget_needed) {
      if (opportunity.budget_needed < preferences.min_budget_range) {
        return false;
      }
    }

    if (preferences.max_budget_range && opportunity.budget_needed) {
      if (opportunity.budget_needed > preferences.max_budget_range) {
        return false;
      }
    }

    // Check geographic scope (if specified)
    if (
      preferences.preferred_geographic_scope &&
      preferences.preferred_geographic_scope.length > 0 &&
      !preferences.preferred_geographic_scope.includes(opportunity.geographic_scope)
    ) {
      return false;
    }

    // Check expected reach (if specified)
    if (preferences.min_expected_reach && opportunity.expected_reach) {
      if (opportunity.expected_reach < preferences.min_expected_reach) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send digest email to a company
   */
  private async sendDigestEmail(
    company: Company,
    preferences: CompanyNotificationPreferences,
    opportunities: SponsorshipOpportunity[],
    notificationType: 'daily_digest' | 'weekly_digest' | 'immediate_alert' | 'featured_opportunity'
  ): Promise<void> {
    // Get company email
    const { data: companyUsers } = await this.supabase
      .from('company_users')
      .select('email, first_name, last_name')
      .eq('company_id', company.id)
      .limit(1)
      .single();

    if (!companyUsers || !companyUsers.email) {
      console.log(`⚠️ No email found for company ${company.name}`);
      return;
    }

    const contactName = companyUsers.first_name
      ? `${companyUsers.first_name} ${companyUsers.last_name || ''}`
      : 'there';

    const subject = this.generateEmailSubject(notificationType, opportunities.length);
    const html = this.generateEmailHtml(contactName, company.name, opportunities, notificationType, preferences.company_id);
    const text = this.generateEmailText(contactName, opportunities, notificationType);

    // Send email
    const result = await this.resend.emails.send({
      from: this.fromEmail,
      to: companyUsers.email,
      subject,
      html,
      text
    });

    // Log notification to database
    await this.supabase
      .from('sponsorship_notifications')
      .insert({
        company_id: company.id,
        notification_type: notificationType,
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_address: companyUsers.email,
        resend_email_id: result.data?.id,
        opportunities_included: opportunities.map(o => o.id),
        opportunities_count: opportunities.length
      });
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(
    notificationType: string,
    opportunityCount: number
  ): string {
    switch (notificationType) {
      case 'daily_digest':
        return `🎯 ${opportunityCount} New Sponsorship Opportunit${opportunityCount === 1 ? 'y' : 'ies'} Today`;
      case 'weekly_digest':
        return `📊 Weekly Sponsorship Digest - ${opportunityCount} Opportunit${opportunityCount === 1 ? 'y' : 'ies'}`;
      case 'immediate_alert':
        return `🚨 Urgent Sponsorship Opportunity - Act Fast!`;
      case 'featured_opportunity':
        return `⭐ Featured Sponsorship Opportunity`;
      default:
        return `🤝 New Sponsorship Opportunities from FraternityBase`;
    }
  }

  /**
   * Generate HTML email content
   */
  private generateEmailHtml(
    contactName: string,
    companyName: string,
    opportunities: SponsorshipOpportunity[],
    notificationType: string,
    companyId: string
  ): string {
    const opportunitiesHtml = opportunities.map(opp => `
      <div style="background: #f8f9fa; border-left: 4px solid #4F46E5; padding: 20px; margin: 15px 0; border-radius: 8px;">
        ${opp.is_featured ? '<div style="color: #f59e0b; font-weight: 600; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">⭐ FEATURED</div>' : ''}
        <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px;">${opp.title}</h3>
        <div style="color: #6B7280; font-size: 14px; margin-bottom: 12px;">
          <strong>${opp.chapter_name}</strong> • ${opp.university_name} (${opp.university_state || 'N/A'})
          ${opp.chapter_grade ? `<br>Chapter Grade: ${opp.chapter_grade}/5 ⭐` : ''}
          ${opp.chapter_member_count ? ` • ${opp.chapter_member_count} members` : ''}
        </div>
        <p style="color: #374151; margin: 12px 0; line-height: 1.6;">${opp.description || 'No description provided'}</p>
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin: 12px 0;">
          ${opp.budget_range ? `<span style="background: #E0E7FF; color: #4338CA; padding: 4px 12px; border-radius: 12px; font-size: 13px;">💰 ${opp.budget_range}</span>` : ''}
          ${opp.expected_reach ? `<span style="background: #DBEAFE; color: #1E40AF; padding: 4px 12px; border-radius: 12px; font-size: 13px;">👥 ${opp.expected_reach.toLocaleString()} reach</span>` : ''}
          <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 13px;">📍 ${opp.geographic_scope}</span>
        </div>
        ${opp.event_date ? `<div style="color: #6B7280; font-size: 13px; margin-top: 8px;">📅 Event Date: ${new Date(opp.event_date).toLocaleDateString()}</div>` : ''}
        ${opp.application_deadline ? `<div style="color: #DC2626; font-size: 13px; margin-top: 4px;">⏰ Apply by: ${new Date(opp.application_deadline).toLocaleDateString()}</div>` : ''}
        <a href="${this.frontendUrl}/sponsorships/${opp.id}" style="display: inline-block; margin-top: 15px; background: #4F46E5; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Details & Apply</a>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsorship Opportunities</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5; margin-bottom: 10px;">FraternityBase</h1>
    <p style="color: #6B7280; font-size: 16px;">Sponsorship Opportunities</p>
  </div>

  <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="margin-top: 0; color: #1F2937;">Hi ${contactName}! 👋</h2>

    <p style="color: #374151; margin: 15px 0;">
      ${notificationType === 'immediate_alert'
        ? `We found an <strong>urgent sponsorship opportunity</strong> that matches ${companyName}'s preferences!`
        : `Here ${opportunities.length === 1 ? 'is' : 'are'} <strong>${opportunities.length} new sponsorship opportunit${opportunities.length === 1 ? 'y' : 'ies'}</strong> from fraternities looking to partner with brands like ${companyName}.`
      }
    </p>

    ${opportunitiesHtml}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
      <a href="${this.frontendUrl}/sponsorships" style="display: inline-block; background: #10B981; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-right: 10px;">Browse All Opportunities</a>
      <a href="${this.frontendUrl}/settings/notifications" style="display: inline-block; color: #6B7280; text-decoration: none; padding: 12px 16px; font-size: 14px;">Manage Email Preferences</a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
    <p>You're receiving this because you subscribed to sponsorship opportunity notifications.</p>
    <p>
      <a href="${this.frontendUrl}/settings/notifications" style="color: #6B7280; text-decoration: underline;">Update preferences</a> ·
      <a href="${this.frontendUrl}/unsubscribe?company_id=${companyId}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
    </p>
    <p style="margin-top: 15px;">© 2025 FraternityBase. All rights reserved.</p>
  </div>

</body>
</html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateEmailText(
    contactName: string,
    opportunities: SponsorshipOpportunity[],
    notificationType: string
  ): string {
    const opportunitiesText = opportunities.map(opp => `
${opp.is_featured ? '⭐ FEATURED' : ''}
${opp.title}
${opp.chapter_name} • ${opp.university_name} (${opp.university_state || 'N/A'})
${opp.description || 'No description provided'}

Budget: ${opp.budget_range || 'Not specified'}
Reach: ${opp.expected_reach ? opp.expected_reach.toLocaleString() : 'Not specified'}
Scope: ${opp.geographic_scope}
${opp.event_date ? `Event Date: ${new Date(opp.event_date).toLocaleDateString()}` : ''}
${opp.application_deadline ? `Apply by: ${new Date(opp.application_deadline).toLocaleDateString()}` : ''}

View details: ${this.frontendUrl}/sponsorships/${opp.id}
    `).join('\n---\n');

    return `
Hi ${contactName}!

${notificationType === 'immediate_alert'
  ? 'We found an URGENT sponsorship opportunity that matches your preferences!'
  : `Here ${opportunities.length === 1 ? 'is' : 'are'} ${opportunities.length} new sponsorship opportunit${opportunities.length === 1 ? 'y' : 'ies'} from fraternities looking to partner with brands like yours.`
}

${opportunitiesText}

---

Browse all opportunities: ${this.frontendUrl}/sponsorships
Manage your email preferences: ${this.frontendUrl}/settings/notifications

© 2025 FraternityBase. All rights reserved.
    `;
  }

  /**
   * Track email open event
   */
  async trackEmailOpen(notificationId: string): Promise<void> {
    await this.supabase
      .from('sponsorship_notifications')
      .update({
        opened_at: new Date().toISOString(),
        open_count: this.supabase.rpc('increment', { row_id: notificationId, amount: 1 })
      })
      .eq('id', notificationId);
  }

  /**
   * Track email click event
   */
  async trackEmailClick(notificationId: string): Promise<void> {
    await this.supabase
      .from('sponsorship_notifications')
      .update({
        clicked_at: new Date().toISOString(),
        click_count: this.supabase.rpc('increment', { row_id: notificationId, amount: 1 })
      })
      .eq('id', notificationId);
  }
}

export default SponsorshipNotificationService;
