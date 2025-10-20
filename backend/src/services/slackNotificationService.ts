interface SlackNotification {
  text: string;
  blocks?: any[];
}

class SlackNotificationService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  private async sendToSlack(notification: SlackNotification): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('⚠️ Slack webhook URL not configured - skipping notification');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        console.error('❌ Failed to send Slack notification:', response.statusText);
      } else {
        console.log('✅ Slack notification sent successfully');
      }
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error);
    }
  }

  async notifyCompanySignup(data: {
    companyName: string;
    userName: string;
    userEmail: string;
    subscriptionTier: string;
  }): Promise<void> {
    const notification = {
      text: `🎉 New Company Signup: ${data.companyName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Company Signup',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Company:*\n${data.companyName}` },
            { type: 'mrkdwn', text: `*Founder:*\n${data.userName}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.userEmail}` },
            { type: 'mrkdwn', text: `*Tier:*\n${data.subscriptionTier}` }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(notification);
  }

  async notifyWaitlistJoin(data: {
    userName: string;
    userEmail: string;
    affiliation?: string;
  }): Promise<void> {
    const notification = {
      text: `📝 New Waitlist Join: ${data.userName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📝 Waitlist Join',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${data.userName}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.userEmail}` },
            { type: 'mrkdwn', text: `*Affiliation:*\n${data.affiliation || 'N/A'}` }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(notification);
  }

  async notifyChapterUnlock(data: {
    companyName: string;
    userName: string;
    chapterName: string;
    universityName: string;
    creditsSpent: number;
    unlockType: string;
    remainingBalance: number;
  }): Promise<void> {
    const notification = {
      text: `🔓 Chapter Unlocked: ${data.chapterName} at ${data.universityName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔓 Chapter Unlocked',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Company:*\n${data.companyName}` },
            { type: 'mrkdwn', text: `*User:*\n${data.userName}` },
            { type: 'mrkdwn', text: `*Chapter:*\n${data.chapterName}` },
            { type: 'mrkdwn', text: `*University:*\n${data.universityName}` },
            { type: 'mrkdwn', text: `*Unlock Type:*\n${data.unlockType}` },
            { type: 'mrkdwn', text: `*Credits Spent:*\n${data.creditsSpent}` },
            { type: 'mrkdwn', text: `*Remaining:*\n${data.remainingBalance} credits` }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(notification);
  }

  async notifyStripePurchase(data: {
    companyName: string;
    userName: string;
    amount: number;
    creditsPurchased: number;
    paymentMethod?: string;
    invoiceId?: string;
  }): Promise<void> {
    const notification = {
      text: `💰 New Purchase: $${(data.amount / 100).toFixed(2)} by ${data.companyName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 Stripe Purchase',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Company:*\n${data.companyName}` },
            { type: 'mrkdwn', text: `*User:*\n${data.userName}` },
            { type: 'mrkdwn', text: `*Amount:*\n$${(data.amount / 100).toFixed(2)}` },
            { type: 'mrkdwn', text: `*Credits:*\n${data.creditsPurchased}` },
            { type: 'mrkdwn', text: `*Payment:*\n${data.paymentMethod || 'N/A'}` },
            { type: 'mrkdwn', text: `*Invoice:*\n${data.invoiceId || 'N/A'}` }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(notification);
  }
}

export const slackNotifier = new SlackNotificationService();
