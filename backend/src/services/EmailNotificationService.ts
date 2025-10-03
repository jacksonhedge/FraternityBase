/**
 * Email Notification Service
 * Sends email notifications to partners using Resend
 */

import { Resend } from 'resend';
import UpdateTrackingService from './UpdateTrackingService';

interface EmailNotification {
  id: string;
  email: string;
  subject: string;
  html_body: string;
  text_body: string;
}

export class EmailNotificationService {
  private resend: Resend;
  private updateService: UpdateTrackingService;
  private fromEmail: string;

  constructor(
    resendApiKey: string,
    supabaseUrl: string,
    supabaseKey: string,
    fromEmail: string = 'updates@fraternitybase.com'
  ) {
    this.resend = new Resend(resendApiKey);
    this.updateService = new UpdateTrackingService(supabaseUrl, supabaseKey);
    this.fromEmail = fromEmail;
  }

  /**
   * Process and send all pending notifications
   */
  async processPendingNotifications(): Promise<number> {
    console.log('Fetching pending notifications...');
    const notifications = await this.updateService.getPendingNotifications();

    if (notifications.length === 0) {
      console.log('No pending notifications to send');
      return 0;
    }

    console.log(`Found ${notifications.length} pending notifications`);
    let sentCount = 0;
    let failedCount = 0;

    for (const notification of notifications) {
      try {
        await this.sendEmail(notification);
        await this.updateService.markNotificationSent(notification.id);
        sentCount++;
        console.log(`✓ Sent notification to ${notification.email}`);
      } catch (error: any) {
        failedCount++;
        console.error(`✗ Failed to send notification to ${notification.email}:`, error.message);
        await this.updateService.markNotificationFailed(notification.id, error.message);
      }

      // Rate limiting: wait 100ms between emails
      await this.sleep(100);
    }

    console.log(`Notification processing complete: ${sentCount} sent, ${failedCount} failed`);
    return sentCount;
  }

  /**
   * Send a single email notification
   */
  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: notification.email,
        subject: notification.subject,
        html: notification.html_body,
        text: notification.text_body
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`Email sent successfully to ${notification.email}, ID: ${result.data?.id}`);
    } catch (error: any) {
      console.error(`Error sending email to ${notification.email}:`, error);
      throw error;
    }
  }

  /**
   * Send a test email to verify configuration
   */
  async sendTestEmail(toEmail: string): Promise<boolean> {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: 'FraternityBase Update Tracking - Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Test Email</h1>
            <p>This is a test email from the FraternityBase Update Tracking system.</p>
            <p>If you received this, your email configuration is working correctly! ✅</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Sent from FraternityBase Update Tracking System<br>
              ${new Date().toISOString()}
            </p>
          </div>
        `,
        text: 'This is a test email from the FraternityBase Update Tracking system. If you received this, your email configuration is working correctly!'
      });

      if (result.error) {
        console.error('Test email failed:', result.error);
        return false;
      }

      console.log('Test email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  /**
   * Send immediate notification for urgent updates
   */
  async sendImmediateNotification(
    email: string,
    subject: string,
    updates: any[]
  ): Promise<void> {
    const html = this.generateUrgentUpdateHtml(updates);
    const text = this.generateUrgentUpdateText(updates);

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: `🚨 ${subject}`,
      html,
      text
    });
  }

  private generateUrgentUpdateHtml(updates: any[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .urgent-badge { background-color: #fef2f2; color: #dc2626; padding: 10px; border-left: 4px solid #dc2626; margin: 20px 0; }
    .update { margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Urgent Update</h1>
    </div>
    <div class="urgent-badge">
      <strong>This is an immediate notification for time-sensitive updates.</strong>
    </div>
    ${updates.map(u => `
      <div class="update">
        <strong>${u.change_summary}</strong>
        ${u.university_name ? `<p>📍 ${u.university_name}</p>` : ''}
      </div>
    `).join('')}
    <p style="margin-top: 30px;">
      <a href="https://fraternitybase.com/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 4px;">
        View on FraternityBase
      </a>
    </p>
  </div>
</body>
</html>
    `;
  }

  private generateUrgentUpdateText(updates: any[]): string {
    let text = '🚨 URGENT UPDATE FROM FRATERNITYBASE\n';
    text += '='.repeat(50) + '\n\n';
    text += 'This is an immediate notification for time-sensitive updates.\n\n';

    updates.forEach(update => {
      text += `• ${update.change_summary}\n`;
      if (update.university_name) {
        text += `  Location: ${update.university_name}\n`;
      }
      text += '\n';
    });

    text += '\nView details: https://fraternitybase.com/dashboard\n';
    return text;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EmailNotificationService;
