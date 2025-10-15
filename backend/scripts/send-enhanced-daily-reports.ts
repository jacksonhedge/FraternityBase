import { config } from 'dotenv';
import { EnhancedDailyReportService } from '../src/services/EnhancedDailyReportService';

// Load environment variables
config();

async function main() {
  console.log('Starting enhanced daily report generation...');
  console.log('Timestamp:', new Date().toISOString());
  console.log('---');

  const reportService = new EnhancedDailyReportService(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    process.env.RESEND_API_KEY || '',
    process.env.FROM_EMAIL || 'updates@fraternitybase.com'
  );

  try {
    const result = await reportService.sendAllEnhancedDailyReports();

    console.log('\n✅ Enhanced daily reports sent successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Successfully sent: ${result.sent}`);
    console.log(`   - Failed: ${result.failed}`);
    console.log(`   - Total: ${result.sent + result.failed}`);

    if (result.failed > 0) {
      console.log('\n⚠️  Some reports failed to send. Check logs above for details.');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error sending enhanced daily reports:', error);
    process.exit(1);
  }
}

main();
