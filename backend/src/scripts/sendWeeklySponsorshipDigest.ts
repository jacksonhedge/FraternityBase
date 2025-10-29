/**
 * Send Weekly Sponsorship Digest Script
 * Sends weekly email digests to companies about new sponsorship opportunities
 *
 * Usage:
 * npm run sponsorship-weekly-digest
 * OR
 * npx tsx src/scripts/sendWeeklySponsorshipDigest.ts
 */

import { config } from 'dotenv';
import path from 'path';
import { SponsorshipNotificationService } from '../services/SponsorshipNotificationService';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fraternitybase.com';

if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting weekly sponsorship digest job...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('---');

  try {
    const service = new SponsorshipNotificationService(
      RESEND_API_KEY,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      'sponsorships@fraternitybase.com',
      FRONTEND_URL
    );

    await service.sendWeeklyDigests();

    console.log('---');
    console.log('✅ Weekly sponsorship digest job completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('---');
    console.error('❌ Error running weekly sponsorship digest job:', error);
    process.exit(1);
  }
}

main();
