/**
 * Credits System Test Script
 * Run this to verify the entire credits system is working
 */

const API_URL = 'http://localhost:3001/api';
require('dotenv').config();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const CRON_SECRET = 'cron_secret_fra7ernity_b4se_2025';

// Test company ID - get this from your admin panel
const TEST_COMPANY_ID = 'e06324d0-6a8c-46f5-b7a1-a01e15dd281f'; // Replace with your test company ID

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(colors.cyan, `\n🧪 Testing: ${name}`);
    await fn();
    log(colors.green, `✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    log(colors.red, `❌ FAILED: ${name}`);
    console.error(error.message);
    return false;
  }
}

async function testAddCreditsEndpoint() {
  const response = await fetch(`${API_URL}/admin/companies/${TEST_COMPANY_ID}/add-credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    },
    body: JSON.stringify({ credits: 10 })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Add credits failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Response:', result);

  if (!result.success) {
    throw new Error('Response not successful');
  }
}

async function testUpdateSubscriptionTier() {
  const response = await fetch(`${API_URL}/admin/companies/${TEST_COMPANY_ID}/subscription-tier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    },
    body: JSON.stringify({ tier: 'monthly' })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Update tier failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Response:', result);

  if (!result.success) {
    throw new Error('Response not successful');
  }
}

async function testCronJobEndpoint() {
  const response = await fetch(`${API_URL}/cron/grant-monthly-credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': CRON_SECRET
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cron job failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Response:', result);

  if (!result.success) {
    throw new Error('Response not successful');
  }
}

async function testCreditPurchaseCheckout() {
  const response = await fetch(`${API_URL}/credits/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credits: 100,
      companyId: TEST_COMPANY_ID
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Credit purchase checkout failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Checkout URL:', result.url);

  if (!result.url || !result.url.includes('stripe.com')) {
    throw new Error('Invalid Stripe checkout URL');
  }
}

async function testSubscriptionCheckout() {
  const response = await fetch(`${API_URL}/credits/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tier: 'monthly',
      companyId: TEST_COMPANY_ID
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Subscription checkout failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Checkout URL:', result.url);

  if (!result.url || !result.url.includes('stripe.com')) {
    throw new Error('Invalid Stripe checkout URL');
  }
}

async function testGetCompanyDetails() {
  const response = await fetch(`${API_URL}/admin/companies/${TEST_COMPANY_ID}`, {
    method: 'GET',
    headers: {
      'x-admin-token': ADMIN_TOKEN
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Get company failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log('   Company:', result.data.company_name);
  console.log('   Credits:', result.data.credits_balance);
  console.log('   Tier:', result.data.subscription_tier || 'Not set');

  if (!result.success || !result.data) {
    throw new Error('Invalid response');
  }
}

async function runTests() {
  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  log(colors.blue, '║   FraternityBase Credits System Tests     ║');
  log(colors.blue, '╚════════════════════════════════════════════╝');

  const results = [];

  results.push(await test('Admin - Add Credits', testAddCreditsEndpoint));
  results.push(await test('Admin - Update Subscription Tier', testUpdateSubscriptionTier));
  results.push(await test('Admin - Get Company Details', testGetCompanyDetails));
  results.push(await test('Cron - Grant Monthly Credits', testCronJobEndpoint));
  results.push(await test('Stripe - Credit Purchase Checkout', testCreditPurchaseCheckout));
  results.push(await test('Stripe - Subscription Checkout', testSubscriptionCheckout));

  const passed = results.filter(r => r).length;
  const total = results.length;

  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  if (passed === total) {
    log(colors.green, `║  ✅ ALL TESTS PASSED (${passed}/${total})                 ║`);
  } else {
    log(colors.yellow, `║  ⚠️  SOME TESTS FAILED (${passed}/${total})               ║`);
  }
  log(colors.blue, '╚════════════════════════════════════════════╝\n');

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  log(colors.red, '\n💥 Test suite crashed:');
  console.error(error);
  process.exit(1);
});
