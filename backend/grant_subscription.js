/**
 * Manual Subscription Granting Script
 * Bypasses Stripe to grant subscription benefits for testing
 *
 * Usage: node grant_subscription.js <user_email> <tier>
 * Example: node grant_subscription.js user@example.com monthly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function grantSubscription(userEmail, tier = 'monthly') {
  try {
    console.log(`\n🔍 Looking up user: ${userEmail}...`);

    // Get user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email === userEmail);

    if (!user) {
      throw new Error(`User not found: ${userEmail}`);
    }

    console.log(`✅ Found user: ${user.id}`);

    // Get user's company_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error('User profile or company not found');
    }

    console.log(`✅ Found company: ${profile.company_id}`);

    // Define subscription benefits
    const benefits = {
      monthly: {
        subscription_tier: 'monthly',
        subscription_status: 'active',
        monthly_unlocks_5_star: 5,
        monthly_unlocks_4_star: 5,
        monthly_unlocks_3_star: 10,
        monthly_warm_intros: 1,
        unlocks_5_star_remaining: 5,
        unlocks_4_star_remaining: 5,
        unlocks_3_star_remaining: 10,
        warm_intros_remaining: 1,
        max_team_seats: 3,
        subscription_started_at: new Date().toISOString(),
        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_benefit_reset_at: new Date().toISOString(),
      },
      enterprise: {
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        monthly_unlocks_5_star: -1, // unlimited
        monthly_unlocks_4_star: -1,
        monthly_unlocks_3_star: -1,
        monthly_warm_intros: 3,
        unlocks_5_star_remaining: -1,
        unlocks_4_star_remaining: -1,
        unlocks_3_star_remaining: -1,
        warm_intros_remaining: 3,
        max_team_seats: 10,
        subscription_started_at: new Date().toISOString(),
        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_benefit_reset_at: new Date().toISOString(),
      }
    };

    const tierBenefits = benefits[tier] || benefits.monthly;

    console.log(`\n🎁 Granting ${tier} subscription benefits...`);

    // Update account_balance
    const { error: updateError } = await supabaseAdmin
      .from('account_balance')
      .update(tierBenefits)
      .eq('company_id', profile.company_id);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // Add 1000 credits for enterprise tier
    if (tier === 'enterprise') {
      console.log('💰 Adding 1000 credits for enterprise tier...');
      await supabaseAdmin.rpc('add_credits', {
        p_company_id: profile.company_id,
        p_credits: 1000,
        p_dollars: 300,
        p_transaction_type: 'subscription_initial_grant',
        p_description: 'Enterprise subscription - 1000 monthly credits',
        p_stripe_payment_intent_id: 'manual_grant'
      });
    }

    console.log('\n✅ Subscription granted successfully!');
    console.log('\nSubscription Details:');
    console.log(`  Tier: ${tier}`);
    console.log(`  5⭐ Unlocks: ${tierBenefits.unlocks_5_star_remaining === -1 ? 'Unlimited' : tierBenefits.unlocks_5_star_remaining}`);
    console.log(`  4⭐ Unlocks: ${tierBenefits.unlocks_4_star_remaining === -1 ? 'Unlimited' : tierBenefits.unlocks_4_star_remaining}`);
    console.log(`  3⭐ Unlocks: ${tierBenefits.unlocks_3_star_remaining === -1 ? 'Unlimited' : tierBenefits.unlocks_3_star_remaining}`);
    console.log(`  Warm Intros: ${tierBenefits.warm_intros_remaining}`);
    console.log(`  Team Seats: ${tierBenefits.max_team_seats}`);
    console.log(`  Period End: ${new Date(tierBenefits.subscription_current_period_end).toLocaleDateString()}`);
    console.log('\n🎉 Ready to test! Refresh your frontend to see the changes.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const userEmail = process.argv[2];
const tier = process.argv[3] || 'monthly';

if (!userEmail) {
  console.error('\n❌ Usage: node grant_subscription.js <user_email> [tier]');
  console.error('   Example: node grant_subscription.js user@example.com monthly\n');
  process.exit(1);
}

if (!['monthly', 'enterprise'].includes(tier)) {
  console.error('\n❌ Tier must be "monthly" or "enterprise"\n');
  process.exit(1);
}

grantSubscription(userEmail, tier).then(() => process.exit(0));
