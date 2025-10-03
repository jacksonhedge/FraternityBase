/**
 * Test Script for Update Tracking System
 * Run this to test the notification system
 */

import UpdateTrackingService from '../backend/src/services/UpdateTrackingService';
import EmailNotificationService from '../backend/src/services/EmailNotificationService';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

async function testUpdateTracking() {
  console.log('🧪 Testing Update Tracking System\n');

  const updateService = new UpdateTrackingService(SUPABASE_URL, SUPABASE_KEY);
  const emailService = new EmailNotificationService(
    RESEND_API_KEY,
    SUPABASE_URL,
    SUPABASE_KEY
  );

  try {
    // Test 1: Subscribe a test partner
    console.log('1️⃣ Testing partner subscription...');
    const subscription = await updateService.subscribePartner({
      company_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      email: 'jackson@hedgepayments.com',
      notification_frequency: 'weekly',
      is_active: true,
      notify_new_colleges: true,
      notify_new_chapters: true,
      notify_chapter_updates: true,
      notify_contact_info_updates: true,
      notify_officer_changes: true,
      notify_event_opportunities: true,
      interested_states: ['PA', 'NY', 'NJ']
    });
    console.log('✓ Subscription created:', subscription.id);

    // Test 2: Log a test update
    console.log('\n2️⃣ Testing manual update logging...');
    const update = await updateService.logUpdate({
      update_type: 'new_chapter',
      entity_type: 'chapter',
      entity_id: '00000000-0000-0000-0000-000000000001',
      entity_name: 'Test Chapter',
      change_summary: 'New chapter added: Sigma Chi at Penn State',
      change_details: {
        organization: 'Sigma Chi',
        university: 'Penn State',
        member_count: 85
      },
      university_name: 'Penn State University',
      university_state: 'PA',
      created_by: 'test-script',
      is_major_update: true
    });
    console.log('✓ Update logged:', update.id);

    // Test 3: Get recent updates
    console.log('\n3️⃣ Testing recent updates retrieval...');
    const recentUpdates = await updateService.getRecentUpdates(10);
    console.log(`✓ Found ${recentUpdates.length} recent updates`);

    // Test 4: Get update stats
    console.log('\n4️⃣ Testing update statistics...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const stats = await updateService.getUpdateStats(startDate);
    console.log('✓ Stats for last 7 days:', stats);

    // Test 5: Send test email
    console.log('\n5️⃣ Testing email service...');
    const emailSent = await emailService.sendTestEmail('jackson@hedgepayments.com');
    console.log(emailSent ? '✓ Test email sent' : '✗ Test email failed');

    // Test 6: Generate digest for subscription
    console.log('\n6️⃣ Testing digest generation...');
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7);
    const updates = await updateService.getUpdatesForPartner(subscription, periodStart);
    console.log(`✓ Found ${updates.length} updates for partner`);

    if (updates.length > 0) {
      const digest = await updateService.generateDigest(subscription, updates);
      console.log('✓ Digest generated:', {
        subject: digest.subject,
        updateCount: digest.update_count
      });

      // Optionally queue the digest
      // await updateService.queueNotification(digest);
      // console.log('✓ Digest queued for sending');
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testUpdateTracking()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { testUpdateTracking };
