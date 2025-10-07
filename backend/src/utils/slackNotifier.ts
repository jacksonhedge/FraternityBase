/**
 * Slack Notification Utility
 * Sends real-time notifications to Slack for major platform events
 */

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

export class SlackNotifier {
  private webhookUrl: string;
  private enabled: boolean;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.enabled = process.env.SLACK_ENABLED === 'true' && !!this.webhookUrl;
  }

  private async send(message: SlackMessage): Promise<void> {
    if (!this.enabled) {
      console.log('[Slack] Notifications disabled or webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        console.error('[Slack] Failed to send notification:', response.statusText);
      }
    } catch (error) {
      console.error('[Slack] Error sending notification:', error);
    }
  }

  private formatTimestamp(): string {
    return new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Notify when a new user signs up
   */
  async notifySignup(data: {
    name: string;
    email: string;
    company: string;
    tier: string;
    assignedChapter?: string;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `🆕 New User Signup: ${data.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆕 New User Signup!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${data.name}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
            { type: 'mrkdwn', text: `*Company:*\n${data.company}` },
            { type: 'mrkdwn', text: `*Tier:*\n${data.tier}` }
          ]
        }
      ]
    };

    if (data.assignedChapter) {
      message.blocks?.push({
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Assigned Chapter:*\n${data.assignedChapter}` }
        ]
      });
    }

    message.blocks?.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
      ]
    });

    await this.send(message);
  }

  /**
   * Notify when a user purchases credits
   */
  async notifyCreditPurchase(data: {
    userName: string;
    company: string;
    packageName: string;
    credits: number;
    amount: number;
    newBalance: number;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `💰 Credit Purchase: ${data.userName} bought ${data.credits} credits`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 Credit Purchase!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*User:*\n${data.userName} @ ${data.company}` },
            { type: 'mrkdwn', text: `*Package:*\n${data.packageName} (${data.credits} credits)` },
            { type: 'mrkdwn', text: `*Amount:*\n$${data.amount.toFixed(2)}` },
            { type: 'mrkdwn', text: `*New Balance:*\n${data.newBalance.toLocaleString()} credits` }
          ]
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
          ]
        }
      ]
    };

    await this.send(message);
  }

  /**
   * Notify when a chapter is unlocked
   */
  async notifyChapterUnlock(data: {
    userName: string;
    company: string;
    chapterName: string;
    universityName: string;
    grade?: number;
    creditsSpent: number;
    remainingBalance: number;
  }): Promise<void> {
    const gradeStars = data.grade ? '⭐'.repeat(Math.floor(data.grade)) : '';
    const gradeText = data.grade ? `${gradeStars} ${data.grade.toFixed(1)}` : 'Not graded';

    const message: SlackMessage = {
      text: `🔓 Chapter Unlocked: ${data.chapterName} at ${data.universityName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔓 Chapter Unlocked!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*User:*\n${data.userName} @ ${data.company}` },
            { type: 'mrkdwn', text: `*Chapter:*\n${data.chapterName} at ${data.universityName}` },
            { type: 'mrkdwn', text: `*Grade:*\n${gradeText}` },
            { type: 'mrkdwn', text: `*Credits:*\n${data.creditsSpent} spent` },
            { type: 'mrkdwn', text: `*Balance:*\n${data.remainingBalance.toLocaleString()} remaining` }
          ]
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
          ]
        }
      ]
    };

    await this.send(message);
  }

  /**
   * Notify when a warm introduction is requested
   */
  async notifyIntroRequest(data: {
    userName: string;
    company: string;
    targetName: string;
    targetChapter: string;
    creditsSpent: number;
    status: string;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `🤝 Warm Introduction Requested: ${data.userName} → ${data.targetName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🤝 Warm Introduction Requested!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*User:*\n${data.userName} @ ${data.company}` },
            { type: 'mrkdwn', text: `*Target:*\n${data.targetName} (${data.targetChapter})` },
            { type: 'mrkdwn', text: `*Credits:*\n${data.creditsSpent} spent` },
            { type: 'mrkdwn', text: `*Status:*\n${data.status}` }
          ]
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
          ]
        }
      ]
    };

    await this.send(message);
  }

  /**
   * Notify when admin adds a 5-star chapter
   */
  async notify5StarChapter(data: {
    adminName: string;
    chapterName: string;
    universityName: string;
    total5StarCount?: number;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `⭐ NEW 5-Star Chapter: ${data.chapterName} at ${data.universityName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⭐ NEW 5-Star Chapter!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Chapter:*\n${data.chapterName} at ${data.universityName}` },
            { type: 'mrkdwn', text: `*Grade:*\n⭐⭐⭐⭐⭐ 5.0` },
            { type: 'mrkdwn', text: `*Added by:*\n${data.adminName}` }
          ]
        }
      ]
    };

    if (data.total5StarCount) {
      message.blocks?.push({
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total 5★ Chapters:*\n${data.total5StarCount}` }
        ]
      });
    }

    message.blocks?.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
      ]
    });

    await this.send(message);
  }

  /**
   * Notify when a subscription is upgraded
   */
  async notifySubscriptionUpgrade(data: {
    userName: string;
    company: string;
    oldTier: string;
    newTier: string;
    creditsGranted: number;
    newBalance: number;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `📈 Subscription Upgrade: ${data.userName} upgraded to ${data.newTier}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📈 Subscription Upgrade!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*User:*\n${data.userName} @ ${data.company}` },
            { type: 'mrkdwn', text: `*Upgrade:*\n${data.oldTier} → ${data.newTier}` },
            { type: 'mrkdwn', text: `*Credits:*\n+${data.creditsGranted} granted` },
            { type: 'mrkdwn', text: `*New Balance:*\n${data.newBalance.toLocaleString()} credits` }
          ]
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
          ]
        }
      ]
    };

    await this.send(message);
  }

  /**
   * Notify when an ambassador is unlocked
   */
  async notifyAmbassadorUnlock(data: {
    userName: string;
    company: string;
    ambassadorName: string;
    universityName: string;
    creditsSpent: number;
    remainingBalance: number;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `🔓 Ambassador Unlocked: ${data.ambassadorName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔓 Ambassador Unlocked!'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*User:*\n${data.userName} @ ${data.company}` },
            { type: 'mrkdwn', text: `*Ambassador:*\n${data.ambassadorName}` },
            { type: 'mrkdwn', text: `*University:*\n${data.universityName}` },
            { type: 'mrkdwn', text: `*Credits:*\n${data.creditsSpent} spent` },
            { type: 'mrkdwn', text: `*Balance:*\n${data.remainingBalance.toLocaleString()} remaining` }
          ]
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
          ]
        }
      ]
    };

    await this.send(message);
  }

  /**
   * Send a critical error alert
   */
  async notifyError(data: {
    errorType: string;
    message: string;
    endpoint?: string;
    userId?: string;
  }): Promise<void> {
    const message: SlackMessage = {
      text: `🚨 ERROR: ${data.errorType}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Critical Error Alert'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Error Type:*\n${data.errorType}` },
            { type: 'mrkdwn', text: `*Message:*\n${data.message}` }
          ]
        }
      ]
    };

    if (data.endpoint) {
      message.blocks?.push({
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Endpoint:*\n${data.endpoint}` }
        ]
      });
    }

    if (data.userId) {
      message.blocks?.push({
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*User ID:*\n${data.userId}` }
        ]
      });
    }

    message.blocks?.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `⏰ ${this.formatTimestamp()}` }
      ]
    });

    await this.send(message);
  }
}

// Export singleton instance
export const slack = new SlackNotifier();
