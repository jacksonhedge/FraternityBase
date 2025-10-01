// SUPER-ADMIN CREDIT MANAGEMENT SYSTEM
// Full control over credits - grant, revoke, adjust, monitor

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Simple admin authentication
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-secret-admin-token-here';
const ADMIN_EMAIL = 'jacksonfitzgerald25@gmail.com';

// Middleware to check admin access
export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const email = req.user?.email;

  if (token !== ADMIN_TOKEN && email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ==========================================
// CREDIT MONITORING DASHBOARD
// ==========================================

export async function getAdminDashboard(req, res) {
  try {
    // Overall statistics
    const stats = await supabase.rpc('get_credit_stats');

    // Recent transactions
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Top users by credits
    const { data: topUsers } = await supabase
      .from('balances')
      .select('*')
      .order('total_credits', { ascending: false })
      .limit(20);

    // Revenue from credits
    const { data: revenue } = await supabase
      .from('transactions')
      .select('amount_paid')
      .eq('transaction_type', 'purchase')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const totalRevenue = revenue?.reduce((sum, t) => sum + (t.amount_paid || 0), 0) || 0;

    res.json({
      stats: {
        totalUsers: stats?.total_users || 0,
        totalCreditsInSystem: stats?.total_credits || 0,
        totalCreditsSpent: stats?.credits_spent || 0,
        monthlyRevenue: totalRevenue,
        averageBalance: stats?.avg_balance || 0
      },
      recentTransactions,
      topUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// GRANT CREDITS (Give free credits)
// ==========================================

export async function grantCredits(req, res) {
  const { companyId, email, credits, reason } = req.body;

  if (!companyId || !credits || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create balance if doesn't exist
    const { error: upsertError } = await supabase
      .from('balances')
      .upsert({
        company_id: companyId,
        company_email: email || 'unknown',
        total_credits: credits
      }, {
        onConflict: 'company_id',
        ignoreDuplicates: false
      });

    if (upsertError) throw upsertError;

    // Add credits
    const { data, error } = await supabase.rpc('add_credits', {
      p_company_id: companyId,
      p_company_email: email || 'unknown',
      p_amount: credits,
      p_stripe_payment_intent: null,
      p_amount_paid: 0,
      p_description: `ADMIN GRANT: ${reason}`
    });

    if (error) throw error;

    // Log admin action
    await logAdminAction({
      action: 'GRANT_CREDITS',
      target: companyId,
      details: { credits, reason },
      adminEmail: req.user?.email || 'system'
    });

    res.json({
      success: true,
      message: `Granted ${credits} credits to ${email || companyId}`,
      newBalance: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// REVOKE CREDITS (Remove credits)
// ==========================================

export async function revokeCredits(req, res) {
  const { companyId, credits, reason } = req.body;

  try {
    // Get current balance
    const { data: balance } = await supabase
      .from('balances')
      .select('total_credits')
      .eq('company_id', companyId)
      .single();

    if (!balance) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const newBalance = Math.max(0, balance.total_credits - credits);

    // Update balance
    await supabase
      .from('balances')
      .update({ total_credits: newBalance })
      .eq('company_id', companyId);

    // Log transaction
    await supabase
      .from('transactions')
      .insert({
        company_id: companyId,
        transaction_type: 'admin_revoke',
        credits_amount: -credits,
        balance_before: balance.total_credits,
        balance_after: newBalance,
        description: `ADMIN REVOKE: ${reason}`
      });

    res.json({
      success: true,
      message: `Revoked ${credits} credits`,
      newBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// REFUND CREDITS (From failed action)
// ==========================================

export async function refundCredits(req, res) {
  const { transactionId, reason } = req.body;

  try {
    // Get original transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Only refund spend transactions
    if (transaction.transaction_type !== 'spend') {
      return res.status(400).json({ error: 'Can only refund spend transactions' });
    }

    // Refund the credits
    const refundAmount = Math.abs(transaction.credits_amount);

    await supabase.rpc('add_credits', {
      p_company_id: transaction.company_id,
      p_company_email: '',
      p_amount: refundAmount,
      p_stripe_payment_intent: null,
      p_amount_paid: 0,
      p_description: `REFUND for transaction ${transactionId}: ${reason}`
    });

    res.json({
      success: true,
      message: `Refunded ${refundAmount} credits`,
      originalTransaction: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// SET BALANCE (Override completely)
// ==========================================

export async function setBalance(req, res) {
  const { companyId, newBalance, reason } = req.body;

  try {
    // Get current balance
    const { data: current } = await supabase
      .from('balances')
      .select('total_credits')
      .eq('company_id', companyId)
      .single();

    const oldBalance = current?.total_credits || 0;

    // Update balance
    await supabase
      .from('balances')
      .upsert({
        company_id: companyId,
        total_credits: newBalance
      }, {
        onConflict: 'company_id'
      });

    // Log the change
    await supabase
      .from('transactions')
      .insert({
        company_id: companyId,
        transaction_type: 'admin_override',
        credits_amount: newBalance - oldBalance,
        balance_before: oldBalance,
        balance_after: newBalance,
        description: `ADMIN OVERRIDE: ${reason}`
      });

    res.json({
      success: true,
      oldBalance,
      newBalance,
      change: newBalance - oldBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// UNLOCK DATA WITHOUT CREDITS (Admin bypass)
// ==========================================

export async function adminUnlock(req, res) {
  const { companyId, chapterId, unlockType, reason } = req.body;

  try {
    // Record the unlock without charging
    await supabase
      .from('unlocked_data')
      .upsert({
        company_id: companyId,
        unlock_type: unlockType,
        chapter_id: chapterId,
        credits_spent: 0,
        expires_at: null
      }, {
        onConflict: 'company_id,unlock_type,chapter_id'
      });

    // Log admin action
    await logAdminAction({
      action: 'ADMIN_UNLOCK',
      target: companyId,
      details: { chapterId, unlockType, reason }
    });

    res.json({
      success: true,
      message: `Unlocked ${unlockType} for chapter ${chapterId} without charge`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// VIEW USER HISTORY
// ==========================================

export async function getUserHistory(req, res) {
  const { companyId } = req.params;

  try {
    // Get balance
    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    // Get unlocked data
    const { data: unlocked } = await supabase
      .from('unlocked_data')
      .select('*')
      .eq('company_id', companyId);

    res.json({
      balance,
      transactions,
      unlocked,
      summary: {
        currentBalance: balance?.total_credits || 0,
        lifetimePurchased: balance?.lifetime_credits_purchased || 0,
        totalSpent: transactions
          ?.filter(t => t.transaction_type === 'spend')
          ?.reduce((sum, t) => sum + Math.abs(t.credits_amount), 0) || 0,
        chaptersUnlocked: [...new Set(unlocked?.map(u => u.chapter_id))].length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// BULK OPERATIONS
// ==========================================

export async function bulkGrantCredits(req, res) {
  const { credits, reason, filter } = req.body;

  try {
    let query = supabase.from('balances').select('company_id, company_email');

    // Apply filters
    if (filter?.minBalance !== undefined) {
      query = query.gte('total_credits', filter.minBalance);
    }
    if (filter?.maxBalance !== undefined) {
      query = query.lte('total_credits', filter.maxBalance);
    }
    if (filter?.hasNeverPurchased) {
      query = query.eq('lifetime_credits_purchased', 0);
    }

    const { data: companies } = await query;

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'No companies match filter' });
    }

    // Grant to each company
    const results = await Promise.all(
      companies.map(company =>
        supabase.rpc('add_credits', {
          p_company_id: company.company_id,
          p_company_email: company.company_email,
          p_amount: credits,
          p_stripe_payment_intent: null,
          p_amount_paid: 0,
          p_description: `BULK GRANT: ${reason}`
        })
      )
    );

    res.json({
      success: true,
      message: `Granted ${credits} credits to ${companies.length} companies`,
      companiesAffected: companies.length,
      totalCreditsGranted: credits * companies.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// CREDIT SYSTEM SETTINGS
// ==========================================

export async function updateCreditPricing(req, res) {
  const { action, newPrice } = req.body;

  try {
    // Update pricing in database
    await supabase
      .from('credit_pricing')
      .upsert({
        action_type: action,
        credit_cost: newPrice,
        updated_at: new Date()
      }, {
        onConflict: 'action_type'
      });

    res.json({
      success: true,
      message: `Updated ${action} to cost ${newPrice} credits`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function logAdminAction({ action, target, details, adminEmail }) {
  try {
    await supabase
      .from('admin_audit_log')
      .insert({
        action,
        target,
        details,
        admin_email: adminEmail,
        created_at: new Date()
      });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// ==========================================
// EXPORT ROUTES
// ==========================================

export default {
  // Monitoring
  getAdminDashboard,
  getUserHistory,

  // Credit manipulation
  grantCredits,
  revokeCredits,
  refundCredits,
  setBalance,

  // Bulk operations
  bulkGrantCredits,

  // System overrides
  adminUnlock,
  updateCreditPricing,

  // Middleware
  requireAdmin
};