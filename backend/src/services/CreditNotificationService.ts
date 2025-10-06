/**
 * Credit Notification Service
 * Sends detailed email notifications for all credit-related events
 */

import { Resend } from 'resend';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface CreditEventDetails {
  companyId: string;
  companyName: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionType: 'stripe_purchase' | 'admin_manual_add' | 'auto_reload' | 'deduction';
  stripePaymentIntentId?: string;
  adminEmail?: string;
  adminName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class CreditNotificationService {
  private resend: Resend;
  private supabase: SupabaseClient;
  private fromEmail: string;
  private adminEmail: string;

  constructor(
    resendApiKey: string,
    supabaseUrl: string,
    supabaseKey: string,
    fromEmail: string = 'credits@fraternitybase.com',
    adminEmail: string = 'admin@fraternitybase.com'
  ) {
    this.resend = new Resend(resendApiKey);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.fromEmail = fromEmail;
    this.adminEmail = adminEmail;
  }

  /**
   * Send notification when credits are added to an account
   */
  async notifyCreditAdded(details: CreditEventDetails): Promise<void> {
    try {
      // Get company contact info
      const { data: company } = await this.supabase
        .from('companies')
        .select('id, name, user_profiles(email, first_name, last_name)')
        .eq('id', details.companyId)
        .single();

      const userProfiles = company?.user_profiles as any;
      const companyEmail = userProfiles?.email;
      const companyContactName = userProfiles?.first_name
        ? `${userProfiles.first_name} ${userProfiles.last_name || ''}`
        : 'there';

      // Send email to company
      if (companyEmail) {
        await this.sendCompanyNotification(
          companyEmail,
          companyContactName,
          details
        );
      }

      // Send email to admin
      await this.sendAdminNotification(details);

      console.log(`✅ Credit notifications sent for ${details.companyName}`);
    } catch (error) {
      console.error('Error sending credit notification:', error);
      // Don't throw - we don't want to block the credit transaction if email fails
    }
  }

  /**
   * Send notification to the company
   */
  private async sendCompanyNotification(
    email: string,
    name: string,
    details: CreditEventDetails
  ): Promise<void> {
    const subject = this.getCompanyEmailSubject(details);
    const html = this.generateCompanyEmailHtml(name, details);
    const text = this.generateCompanyEmailText(name, details);

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject,
      html,
      text
    });

    console.log(`📧 Company notification sent to ${email}`);
  }

  /**
   * Send notification to admin
   */
  private async sendAdminNotification(details: CreditEventDetails): Promise<void> {
    const subject = this.getAdminEmailSubject(details);
    const html = this.generateAdminEmailHtml(details);
    const text = this.generateAdminEmailText(details);

    await this.resend.emails.send({
      from: this.fromEmail,
      to: this.adminEmail,
      subject,
      html,
      text
    });

    console.log(`📧 Admin notification sent to ${this.adminEmail}`);
  }

  /**
   * Generate subject line for company email
   */
  private getCompanyEmailSubject(details: CreditEventDetails): string {
    switch (details.transactionType) {
      case 'stripe_purchase':
        return `✅ Payment Received - $${details.amount.toFixed(2)} Added to Your Account`;
      case 'admin_manual_add':
        return `🎁 Credits Added - $${details.amount.toFixed(2)} Added to Your Account`;
      case 'auto_reload':
        return `🔄 Auto-Reload Complete - $${details.amount.toFixed(2)} Added`;
      default:
        return `💰 Account Update - $${details.amount.toFixed(2)}`;
    }
  }

  /**
   * Generate subject line for admin email
   */
  private getAdminEmailSubject(details: CreditEventDetails): string {
    switch (details.transactionType) {
      case 'stripe_purchase':
        return `💳 Credit Purchase - ${details.companyName} - $${details.amount.toFixed(2)}`;
      case 'admin_manual_add':
        return `➕ Manual Credit Added - ${details.companyName} - $${details.amount.toFixed(2)}`;
      case 'auto_reload':
        return `🔄 Auto-Reload Triggered - ${details.companyName} - $${details.amount.toFixed(2)}`;
      default:
        return `💰 Credit Event - ${details.companyName} - $${details.amount.toFixed(2)}`;
    }
  }

  /**
   * Generate HTML email for company
   */
  private generateCompanyEmailHtml(name: string, details: CreditEventDetails): string {
    const eventDescription = this.getEventDescription(details);
    const icon = this.getEventIcon(details.transactionType);

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .icon { font-size: 48px; margin-bottom: 10px; }
    .content { background-color: #ffffff; padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
    .balance-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .balance-card .label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
    .balance-card .amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
    .transaction-details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #111827; }
    .success-badge { background-color: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
    .cta-button { display: inline-block; background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">${icon}</div>
      <h1>Credits Added Successfully</h1>
      <div class="success-badge">COMPLETED</div>
    </div>

    <div class="content">
      <p>Hi ${name},</p>

      <p>${eventDescription}</p>

      <div class="balance-card">
        <div class="label">New Account Balance</div>
        <div class="amount">$${details.balanceAfter.toFixed(2)}</div>
        <div class="label" style="font-size: 12px; margin-top: 10px;">
          Previous Balance: $${details.balanceBefore.toFixed(2)}
        </div>
      </div>

      <div class="transaction-details">
        <h3 style="margin-top: 0;">Transaction Details</h3>
        <div class="detail-row">
          <span class="detail-label">Amount Added:</span>
          <span class="detail-value" style="color: #10b981; font-weight: 700;">+$${details.amount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction Type:</span>
          <span class="detail-value">${this.formatTransactionType(details.transactionType)}</span>
        </div>
        ${details.stripePaymentIntentId ? `
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value" style="font-family: monospace; font-size: 12px;">${details.stripePaymentIntentId}</span>
        </div>
        ` : ''}
        ${details.adminName ? `
        <div class="detail-row">
          <span class="detail-label">Added By:</span>
          <span class="detail-value">${details.adminName}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Company:</span>
          <span class="detail-value">${details.companyName}</span>
        </div>
      </div>

      <p>You can now use these credits to unlock chapter contacts, request warm introductions, and access premium features on FraternityBase.</p>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'https://fraternitybase.com'}/app/dashboard" class="cta-button">
          View Dashboard
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Questions? Reply to this email or contact our support team.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        <strong>FraternityBase</strong><br>
        Connecting brands with Greek life communities
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px;">
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email for company
   */
  private generateCompanyEmailText(name: string, details: CreditEventDetails): string {
    const eventDescription = this.getEventDescription(details);

    let text = `FRATERNITYBASE - CREDITS ADDED\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Hi ${name},\n\n`;
    text += `${eventDescription}\n\n`;
    text += `NEW BALANCE: $${details.balanceAfter.toFixed(2)}\n`;
    text += `Previous Balance: $${details.balanceBefore.toFixed(2)}\n\n`;
    text += `TRANSACTION DETAILS:\n`;
    text += `-`.repeat(50) + '\n';
    text += `Amount Added: +$${details.amount.toFixed(2)}\n`;
    text += `Transaction Type: ${this.formatTransactionType(details.transactionType)}\n`;
    if (details.stripePaymentIntentId) {
      text += `Payment ID: ${details.stripePaymentIntentId}\n`;
    }
    if (details.adminName) {
      text += `Added By: ${details.adminName}\n`;
    }
    text += `Date: ${new Date().toLocaleString()}\n`;
    text += `Company: ${details.companyName}\n\n`;
    text += `You can now use these credits on FraternityBase.\n\n`;
    text += `View your dashboard: ${process.env.FRONTEND_URL || 'https://fraternitybase.com'}/app/dashboard\n\n`;
    text += `Questions? Contact our support team.\n\n`;
    text += `--\n`;
    text += `FraternityBase\n`;
    text += `Connecting brands with Greek life communities\n`;

    return text;
  }

  /**
   * Generate HTML email for admin
   */
  private generateAdminEmailHtml(details: CreditEventDetails): string {
    const icon = this.getEventIcon(details.transactionType);

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header .icon { font-size: 36px; margin-right: 10px; }
    .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-card { background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #111827; }
    .detail-section { margin: 20px 0; }
    .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #6b7280; }
    .value { color: #111827; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge-stripe { background-color: #eff6ff; color: #1e40af; }
    .badge-manual { background-color: #fef3c7; color: #92400e; }
    .badge-auto { background-color: #ecfdf5; color: #065f46; }
    .footer { background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${icon} Credit Transaction Alert</h1>
    </div>

    <div class="content">
      ${details.transactionType === 'admin_manual_add' ? `
      <div class="alert">
        <strong>⚠️ Manual Credit Addition</strong><br>
        Credits were manually added by an admin. Please verify this was authorized.
      </div>
      ` : ''}

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Amount Added</div>
          <div class="stat-value" style="color: #10b981;">+$${details.amount.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">New Balance</div>
          <div class="stat-value">$${details.balanceAfter.toFixed(2)}</div>
        </div>
      </div>

      <div class="detail-section">
        <h3 style="margin-top: 0;">Transaction Information</h3>
        <div class="detail-row">
          <span class="label">Company:</span>
          <span class="value"><strong>${details.companyName}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Company ID:</span>
          <span class="value" style="font-family: monospace; font-size: 12px;">${details.companyId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction Type:</span>
          <span class="value">${this.getTransactionBadge(details.transactionType)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount:</span>
          <span class="value" style="color: #10b981; font-weight: 700;">+$${details.amount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Balance Before:</span>
          <span class="value">$${details.balanceBefore.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Balance After:</span>
          <span class="value">$${details.balanceAfter.toFixed(2)}</span>
        </div>
        ${details.stripePaymentIntentId ? `
        <div class="detail-row">
          <span class="label">Stripe Payment Intent:</span>
          <span class="value" style="font-family: monospace; font-size: 11px;">${details.stripePaymentIntentId}</span>
        </div>
        ` : ''}
        ${details.adminEmail ? `
        <div class="detail-row">
          <span class="label">Added By Admin:</span>
          <span class="value">${details.adminName || details.adminEmail}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="label">Timestamp:</span>
          <span class="value">${new Date().toISOString()}</span>
        </div>
        ${details.description ? `
        <div class="detail-row">
          <span class="label">Description:</span>
          <span class="value">${details.description}</span>
        </div>
        ` : ''}
      </div>

      ${details.metadata && Object.keys(details.metadata).length > 0 ? `
      <div class="detail-section">
        <h3>Additional Metadata</h3>
        <pre style="background-color: #f9fafb; padding: 15px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${JSON.stringify(details.metadata, null, 2)}</pre>
      </div>
      ` : ''}

      <p style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 6px; font-size: 14px;">
        <strong>Action Required:</strong><br>
        ${this.getAdminActionMessage(details.transactionType)}
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        FraternityBase Admin Alert System<br>
        ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email for admin
   */
  private generateAdminEmailText(details: CreditEventDetails): string {
    let text = `FRATERNITYBASE ADMIN - CREDIT TRANSACTION ALERT\n`;
    text += `${'='.repeat(60)}\n\n`;

    if (details.transactionType === 'admin_manual_add') {
      text += `⚠️ MANUAL CREDIT ADDITION\n`;
      text += `Credits were manually added by an admin. Please verify this was authorized.\n\n`;
    }

    text += `TRANSACTION SUMMARY:\n`;
    text += `-`.repeat(60) + '\n';
    text += `Amount Added: +$${details.amount.toFixed(2)}\n`;
    text += `New Balance: $${details.balanceAfter.toFixed(2)}\n`;
    text += `Previous Balance: $${details.balanceBefore.toFixed(2)}\n\n`;

    text += `DETAILS:\n`;
    text += `-`.repeat(60) + '\n';
    text += `Company: ${details.companyName}\n`;
    text += `Company ID: ${details.companyId}\n`;
    text += `Transaction Type: ${this.formatTransactionType(details.transactionType)}\n`;

    if (details.stripePaymentIntentId) {
      text += `Stripe Payment Intent: ${details.stripePaymentIntentId}\n`;
    }
    if (details.adminEmail) {
      text += `Added By Admin: ${details.adminName || details.adminEmail}\n`;
    }
    text += `Timestamp: ${new Date().toISOString()}\n`;
    if (details.description) {
      text += `Description: ${details.description}\n`;
    }

    if (details.metadata && Object.keys(details.metadata).length > 0) {
      text += `\nADDITIONAL METADATA:\n`;
      text += JSON.stringify(details.metadata, null, 2) + '\n';
    }

    text += `\nACTION REQUIRED:\n`;
    text += this.getAdminActionMessage(details.transactionType) + '\n\n';
    text += `--\n`;
    text += `FraternityBase Admin Alert System\n`;
    text += new Date().toLocaleString() + '\n';

    return text;
  }

  /**
   * Get event description for company email
   */
  private getEventDescription(details: CreditEventDetails): string {
    switch (details.transactionType) {
      case 'stripe_purchase':
        return `Your payment has been successfully processed and $${details.amount.toFixed(2)} has been added to your FraternityBase account.`;
      case 'admin_manual_add':
        return `You've received a credit bonus of $${details.amount.toFixed(2)} from the FraternityBase team!`;
      case 'auto_reload':
        return `Your account balance was running low, so we've automatically recharged it with $${details.amount.toFixed(2)} using your saved payment method.`;
      default:
        return `$${details.amount.toFixed(2)} has been added to your account.`;
    }
  }

  /**
   * Get icon for transaction type
   */
  private getEventIcon(type: string): string {
    switch (type) {
      case 'stripe_purchase': return '💳';
      case 'admin_manual_add': return '🎁';
      case 'auto_reload': return '🔄';
      default: return '💰';
    }
  }

  /**
   * Format transaction type for display
   */
  private formatTransactionType(type: string): string {
    switch (type) {
      case 'stripe_purchase': return 'Stripe Payment';
      case 'admin_manual_add': return 'Manual Credit Addition (Admin)';
      case 'auto_reload': return 'Automatic Account Reload';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  /**
   * Get HTML badge for transaction type (admin email)
   */
  private getTransactionBadge(type: string): string {
    switch (type) {
      case 'stripe_purchase':
        return '<span class="badge badge-stripe">Stripe Payment</span>';
      case 'admin_manual_add':
        return '<span class="badge badge-manual">Manual Addition</span>';
      case 'auto_reload':
        return '<span class="badge badge-auto">Auto-Reload</span>';
      default:
        return `<span class="badge">${type}</span>`;
    }
  }

  /**
   * Get admin action message based on transaction type
   */
  private getAdminActionMessage(type: string): string {
    switch (type) {
      case 'stripe_purchase':
        return 'No action required. This was a legitimate Stripe payment. Monitor for any chargebacks or disputes.';
      case 'admin_manual_add':
        return 'Verify this manual credit addition was authorized and document the reason in your admin logs.';
      case 'auto_reload':
        return 'No action required. This was an automated reload triggered by low balance. Monitor for any payment failures.';
      default:
        return 'Review this transaction and take appropriate action if needed.';
    }
  }
}

export default CreditNotificationService;
