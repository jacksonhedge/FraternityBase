#!/usr/bin/env tsx
/**
 * Send Daily Reports
 *
 * Sends daily email reports to all approved companies with:
 * - New chapters added in the last 24 hours
 * - New roster members added in the last 24 hours
 * - High-grade chapters (5.0 and 4.5 - "introducable")
 *
 * Usage:
 *   npm run daily-report
 *   or
 *   npx tsx scripts/send-daily-reports.ts
 */

import dotenv from 'dotenv';
import { DailyReportService } from '../src/services/DailyReportService';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;
const fromEmail = process.env.FROM_EMAIL || 'updates@fraternitybase.com';

async function main() {
  console.log('📊 FraternityBase Daily Report Generator\n');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
    console.error('❌ Missing required environment variables:');
    if (!supabaseUrl) console.error('  - SUPABASE_URL');
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    if (!resendApiKey) console.error('  - RESEND_API_KEY');
    process.exit(1);
  }

  // Initialize service
  const reportService = new DailyReportService(
    supabaseUrl,
    supabaseServiceKey,
    resendApiKey,
    fromEmail
  );

  try {
    // Send all daily reports
    const result = await reportService.sendAllDailyReports();

    console.log('\n' + '='.repeat(60));
    console.log('✨ Daily Report Summary');
    console.log('='.repeat(60));
    console.log(`✓ Sent: ${result.sent}`);
    console.log(`✗ Failed: ${result.failed}`);
    console.log(`Total: ${result.sent + result.failed}`);
    console.log(`Completed at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    if (result.failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
