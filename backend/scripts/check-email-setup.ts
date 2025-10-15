/**
 * Check Email Setup Script
 * Verifies that the email configuration is ready for sending daily newsletters
 */

import { config } from 'dotenv';
import { Resend } from 'resend';

config();

async function checkEmailSetup() {
  console.log('🔍 Checking Email Setup for Daily Newsletter\n');
  console.log('=' .repeat(60));

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  const requiredEnvVars = {
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'FROM_EMAIL': process.env.FROM_EMAIL,
    'ADMIN_EMAIL': process.env.ADMIN_EMAIL,
    'CRON_SECRET': process.env.CRON_SECRET
  };

  let envVarsOk = true;
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    const status = value ? '✅' : '❌';
    console.log(`   ${status} ${key}: ${value ? (key.includes('KEY') || key.includes('SECRET') ? '[SET]' : value) : '[MISSING]'}`);
    if (!value) envVarsOk = false;
  }

  if (!envVarsOk) {
    console.log('\n❌ Missing required environment variables!');
    process.exit(1);
  }

  // Check Resend API connection
  console.log('\n📧 Resend API:');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Try to get domains (this will validate the API key)
    const { data: domains, error } = await resend.domains.list() as any;

    if (error) {
      console.log('   ❌ Error connecting to Resend:', error);
      process.exit(1);
    }

    console.log('   ✅ API Key valid');
    console.log(`   ℹ️  Domains configured: ${domains?.data?.length || 0}`);

    // Check if fraternitybase.com is verified
    const fraternitybaseDomain = domains?.data?.find((d: any) =>
      d.name === 'fraternitybase.com'
    );

    console.log('\n🌐 Domain Verification (fraternitybase.com):');
    if (fraternitybaseDomain) {
      const status = fraternitybaseDomain.status === 'verified' ? '✅' : '⚠️';
      console.log(`   ${status} Status: ${fraternitybaseDomain.status}`);

      if (fraternitybaseDomain.status === 'verified') {
        console.log('   ✅ Domain is verified and ready to send emails!');
      } else {
        console.log('   ⚠️  Domain is not verified yet');
        console.log('   📝 Please add the DNS records provided by Resend');
        console.log('   🔗 Visit: https://resend.com/domains');
      }

      // Show DNS records if available
      if (fraternitybaseDomain.records && fraternitybaseDomain.records.length > 0) {
        console.log('\n   📋 Required DNS Records:');
        fraternitybaseDomain.records.forEach((record: any) => {
          console.log(`      Type: ${record.record_type}`);
          console.log(`      Host: ${record.host || record.name}`);
          console.log(`      Value: ${record.value}`);
          console.log('      ---');
        });
      }
    } else {
      console.log('   ❌ Domain not found in Resend');
      console.log('   📝 You need to add fraternitybase.com to Resend');
      console.log('   🔗 Visit: https://resend.com/domains');
      console.log('   ➕ Click "Add Domain" and enter: fraternitybase.com');
    }

    // Test email sending capability
    console.log('\n✉️  Email Sending Test:');
    console.log(`   From: ${process.env.FROM_EMAIL}`);
    console.log(`   To: ${process.env.ADMIN_EMAIL} (test recipient)`);

    const canSendToAnyone = fraternitybaseDomain?.status === 'verified';

    if (canSendToAnyone) {
      console.log('   ✅ Can send to any recipient');
      console.log('   ✅ Ready for production use!');
    } else {
      console.log('   ⚠️  Can only send to verified email addresses');
      console.log(`   ℹ️  Currently can send test emails to: ${process.env.ADMIN_EMAIL}`);
      console.log('   📝 Verify your domain to send to all recipients');
    }

  } catch (error: any) {
    console.log('   ❌ Error:', error.message);
    process.exit(1);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:\n');

  if (envVarsOk) {
    console.log('✅ Environment variables configured');
  }

  const domainVerified = domains?.data?.find((d: any) =>
    d.name === 'fraternitybase.com' && d.status === 'verified'
  );

  if (domainVerified) {
    console.log('✅ Domain verified and ready');
    console.log('✅ Daily newsletter system is READY for production!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test: npm run daily-report-enhanced');
    console.log('   2. Deploy to Vercel to activate daily cron');
  } else {
    console.log('⚠️  Domain verification pending');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to https://resend.com/domains');
    console.log('   2. Add fraternitybase.com if not added');
    console.log('   3. Configure DNS records as shown above');
    console.log('   4. Wait for verification (5-10 minutes)');
    console.log('   5. Run this script again to verify');
    console.log('\n   Meanwhile, you can test with:');
    console.log('   npm run daily-report-enhanced');
    console.log(`   (will send to ${process.env.ADMIN_EMAIL})`);
  }

  console.log('\n' + '='.repeat(60));
}

checkEmailSetup().catch(console.error);
