/**
 * Notification Processor Cron Job
 * Runs on a schedule to process and send update notifications
 */

import * as cron from 'node-cron';
import UpdateTrackingService from '../services/UpdateTrackingService';
import EmailNotificationService from '../services/EmailNotificationService';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'updates@fraternitybase.com';

const updateService = new UpdateTrackingService(SUPABASE_URL, SUPABASE_KEY);
const emailService = new EmailNotificationService(RESEND_API_KEY, SUPABASE_URL, SUPABASE_KEY, FROM_EMAIL);

/**
 * Daily notifications - Run every day at 9 AM EST
 */
export const dailyNotificationJob = cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Starting daily notification processing...');
  try {
    // Generate digests for daily subscribers
    const count = await updateService.processNotifications('daily');
    console.log(`[CRON] Generated ${count} daily digests`);

    // Send all pending notifications
    const sentCount = await emailService.processPendingNotifications();
    console.log(`[CRON] Sent ${sentCount} emails`);
  } catch (error) {
    console.error('[CRON] Error in daily notification job:', error);
  }
}, {
  timezone: 'America/New_York'
});

/**
 * Weekly notifications - Run every Monday at 9 AM EST
 */
export const weeklyNotificationJob = cron.schedule('0 9 * * 1', async () => {
  console.log('[CRON] Starting weekly notification processing...');
  try {
    const count = await updateService.processNotifications('weekly');
    console.log(`[CRON] Generated ${count} weekly digests`);

    const sentCount = await emailService.processPendingNotifications();
    console.log(`[CRON] Sent ${sentCount} emails`);
  } catch (error) {
    console.error('[CRON] Error in weekly notification job:', error);
  }
}, {
  timezone: 'America/New_York'
});

/**
 * Biweekly notifications - Run every other Monday at 9 AM EST
 */
export const biweeklyNotificationJob = cron.schedule('0 9 */14 * 1', async () => {
  console.log('[CRON] Starting biweekly notification processing...');
  try {
    const count = await updateService.processNotifications('biweekly');
    console.log(`[CRON] Generated ${count} biweekly digests`);

    const sentCount = await emailService.processPendingNotifications();
    console.log(`[CRON] Sent ${sentCount} emails`);
  } catch (error) {
    console.error('[CRON] Error in biweekly notification job:', error);
  }
}, {
  timezone: 'America/New_York'
});

/**
 * Monthly notifications - Run on the 1st of each month at 9 AM EST
 */
export const monthlyNotificationJob = cron.schedule('0 9 1 * *', async () => {
  console.log('[CRON] Starting monthly notification processing...');
  try {
    const count = await updateService.processNotifications('monthly');
    console.log(`[CRON] Generated ${count} monthly digests`);

    const sentCount = await emailService.processPendingNotifications();
    console.log(`[CRON] Sent ${sentCount} emails`);
  } catch (error) {
    console.error('[CRON] Error in monthly notification job:', error);
  }
}, {
  timezone: 'America/New_York'
});

/**
 * Cleanup old notifications - Run every Sunday at 2 AM EST
 * Removes sent/failed notifications older than 90 days
 */
export const cleanupJob = cron.schedule('0 2 * * 0', async () => {
  console.log('[CRON] Starting notification cleanup...');
  // TODO: Implement cleanup logic
}, {
  timezone: 'America/New_York'
});

/**
 * Start all cron jobs
 */
export function startNotificationCrons() {
  console.log('Starting notification cron jobs...');
  dailyNotificationJob.start();
  weeklyNotificationJob.start();
  biweeklyNotificationJob.start();
  monthlyNotificationJob.start();
  cleanupJob.start();
  console.log('✓ All notification cron jobs started');
}

/**
 * Stop all cron jobs
 */
export function stopNotificationCrons() {
  console.log('Stopping notification cron jobs...');
  dailyNotificationJob.stop();
  weeklyNotificationJob.stop();
  biweeklyNotificationJob.stop();
  monthlyNotificationJob.stop();
  cleanupJob.stop();
  console.log('✓ All notification cron jobs stopped');
}

// Export for manual testing
export { updateService, emailService };
