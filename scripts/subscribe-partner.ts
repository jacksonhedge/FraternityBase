#!/usr/bin/env ts-node

/**
 * CLI Tool: Subscribe a Partner to Updates
 * Usage: ts-node scripts/subscribe-partner.ts
 */

import * as readline from 'readline';
import UpdateTrackingService from '../backend/src/services/UpdateTrackingService';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function subscribePartner() {
  console.log('🔔 FraternityBase Partner Subscription Tool\n');

  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

  const updateService = new UpdateTrackingService(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Collect information
    const email = await question('Partner email: ');
    const companyId = await question('Company ID (UUID): ');

    console.log('\nNotification frequency:');
    console.log('  1. Daily');
    console.log('  2. Weekly');
    console.log('  3. Biweekly');
    console.log('  4. Monthly');
    const freqChoice = await question('Choose (1-4): ');

    const frequencies: Record<string, 'daily' | 'weekly' | 'biweekly' | 'monthly'> = {
      '1': 'daily',
      '2': 'weekly',
      '3': 'biweekly',
      '4': 'monthly'
    };
    const frequency = frequencies[freqChoice] || 'weekly';

    console.log('\nWhat types of updates should they receive?');
    const notifyNewColleges = (await question('New colleges? (y/n): ')).toLowerCase() === 'y';
    const notifyNewChapters = (await question('New chapters? (y/n): ')).toLowerCase() === 'y';
    const notifyChapterUpdates = (await question('Chapter updates? (y/n): ')).toLowerCase() === 'y';
    const notifyContactInfo = (await question('Contact info updates? (y/n): ')).toLowerCase() === 'y';
    const notifyOfficerChanges = (await question('Officer changes? (y/n): ')).toLowerCase() === 'y';
    const notifyEventOpportunities = (await question('Event opportunities? (y/n): ')).toLowerCase() === 'y';

    const statesInput = await question('\nInterested states (comma-separated, e.g., PA,NY,NJ) or press Enter for all: ');
    const interestedStates = statesInput ? statesInput.split(',').map(s => s.trim().toUpperCase()) : undefined;

    // Create subscription
    console.log('\n⏳ Creating subscription...');
    const subscription = await updateService.subscribePartner({
      company_id: companyId,
      email,
      notification_frequency: frequency,
      is_active: true,
      notify_new_colleges: notifyNewColleges,
      notify_new_chapters: notifyNewChapters,
      notify_chapter_updates: notifyChapterUpdates,
      notify_contact_info_updates: notifyContactInfo,
      notify_officer_changes: notifyOfficerChanges,
      notify_event_opportunities: notifyEventOpportunities,
      interested_states: interestedStates
    });

    console.log('\n✅ Subscription created successfully!');
    console.log('\nDetails:');
    console.log(`  Subscription ID: ${subscription.id}`);
    console.log(`  Email: ${subscription.email}`);
    console.log(`  Frequency: ${subscription.notification_frequency}`);
    console.log(`  States: ${interestedStates?.join(', ') || 'All'}`);
    console.log('\nThey will start receiving updates on the next scheduled notification.');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
  }
}

// Run
subscribePartner();
