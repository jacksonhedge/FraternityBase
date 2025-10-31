import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PRICING } from '../config/pricing';

const router = Router();

// Lazy initialization
let supabaseAdmin: ReturnType<typeof createClient>;

function getSupabaseAdmin(): any {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdmin;
}

// POST /partnerships/request - Submit a partnership request
router.post('/request', async (req, res) => {
  try {
    const { companyId, chapterId, message, proposedCompensation } = req.body;

    if (!companyId || !chapterId || !proposedCompensation) {
      return res.status(400).json({
        error: 'Company ID, Chapter ID, and proposed compensation are required'
      });
    }

    // Validate minimum compensation
    if (proposedCompensation < PRICING.MIN_PARTNERSHIP_COMPENSATION) {
      return res.status(400).json({
        error: `Minimum partnership compensation is ${PRICING.MIN_PARTNERSHIP_COMPENSATION}`
      });
    }

    const supabase = getSupabaseAdmin();

    // Check if company can submit request (quota)
    const { data: canSubmit, error: quotaError } = await supabase
      .rpc('can_submit_partnership_request', { p_company_id: companyId });

    if (quotaError) {
      console.error('Error checking quota:', quotaError);
      return res.status(500).json({ error: 'Failed to check request quota' });
    }

    if (!canSubmit) {
      return res.status(403).json({
        error: 'Partnership request quota exceeded. Please upgrade your subscription or wait until next month.'
      });
    }

    // Calculate platform fee and total
    const { compensation, platformFee, total } = PRICING.calculateTotal(proposedCompensation);

    // Create partnership request
    const { data: request, error: requestError } = await supabase
      .from('partnership_requests')
      .insert({
        company_id: companyId,
        chapter_id: chapterId,
        message,
        proposed_compensation: compensation,
        platform_fee: platformFee,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating partnership request:', requestError);
      return res.status(500).json({ error: 'Failed to create partnership request' });
    }

    // Increment usage counter
    const { error: incrementError } = await supabase
      .rpc('increment_partnership_request_usage', { p_company_id: companyId });

    if (incrementError) {
      console.error('Error incrementing usage:', incrementError);
      // Continue anyway - request was created
    }

    // Get company and chapter info for notification
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', companyId)
      .single();

    const { data: chapter } = await supabase
      .from('chapters')
      .select('chapter_name, universities(name)')
      .eq('id', chapterId)
      .single();

    // TODO: Send notification to chapter (email/push)
    // TODO: Send Slack notification to admin

    res.json({
      success: true,
      request: {
        id: request.id,
        status: request.status,
        compensation: compensation,
        platformFee: platformFee,
        total: total,
        chapter: {
          name: chapter?.chapter_name,
          university: chapter?.universities?.name
        }
      },
      message: 'Partnership request submitted successfully. The chapter will be notified.'
    });
  } catch (error: any) {
    console.error('Partnership request error:', error);
    res.status(500).json({ error: 'Failed to submit partnership request', details: error.message });
  }
});

// GET /partnerships/requests - Get all partnership requests for a company
router.get('/requests', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    const { data: requests, error } = await supabase
      .from('partnership_requests')
      .select(`
        *,
        chapters(
          id,
          chapter_name,
          greek_organizations(name),
          universities(name)
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partnership requests:', error);
      return res.status(500).json({ error: 'Failed to fetch partnership requests' });
    }

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch partnership requests error:', error);
    res.status(500).json({ error: 'Failed to fetch partnership requests' });
  }
});

// GET /partnerships/requests/:id - Get a single partnership request
router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { data: request, error } = await supabase
      .from('partnership_requests')
      .select(`
        *,
        chapters(
          id,
          chapter_name,
          contact_email,
          greek_organizations(name),
          universities(name)
        ),
        companies(
          id,
          company_name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !request) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    res.json({ success: true, request });
  } catch (error: any) {
    console.error('Fetch partnership request error:', error);
    res.status(500).json({ error: 'Failed to fetch partnership request' });
  }
});

// GET /partnerships/quota - Get partnership request quota for a company
router.get('/quota', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    const { data: account, error } = await supabase
      .from('account_balance')
      .select('partnership_requests_quota, partnership_requests_used, subscription_tier, partnership_requests_reset_at')
      .eq('company_id', companyId)
      .single();

    if (error || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const remaining = account.subscription_tier === 'enterprise'
      ? 'unlimited'
      : Math.max(0, account.partnership_requests_quota - account.partnership_requests_used);

    res.json({
      success: true,
      quota: {
        total: account.subscription_tier === 'enterprise' ? 'unlimited' : account.partnership_requests_quota,
        used: account.partnership_requests_used,
        remaining,
        resetAt: account.partnership_requests_reset_at,
        tier: account.subscription_tier
      }
    });
  } catch (error: any) {
    console.error('Fetch quota error:', error);
    res.status(500).json({ error: 'Failed to fetch quota' });
  }
});

// PATCH /partnerships/requests/:id/cancel - Cancel a partnership request
router.patch('/requests/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: request, error: fetchError } = await supabase
      .from('partnership_requests')
      .select('company_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    if (request.company_id !== companyId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    // Cancel the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('partnership_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling request:', updateError);
      return res.status(500).json({ error: 'Failed to cancel request' });
    }

    // Decrement usage counter (give credit back)
    await supabase
      .from('account_balance')
      .update({ partnership_requests_used: supabase.raw('partnership_requests_used - 1') })
      .eq('company_id', companyId);

    res.json({
      success: true,
      request: updatedRequest,
      message: 'Partnership request cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// Admin endpoints

// GET /partnerships/admin/all - Get all partnership requests (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    // Admin authentication check
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized - admin access required' });
    }

    const supabase = getSupabaseAdmin();

    const { data: requests, error } = await supabase
      .from('partnership_requests')
      .select(`
        *,
        chapters(
          id,
          chapter_name,
          contact_email,
          greek_organizations(name),
          universities(name)
        ),
        companies(
          id,
          company_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// PATCH /partnerships/admin/:id/status - Update partnership request status (admin only)
router.patch('/admin/:id/status', async (req, res) => {
  try {
    // Admin authentication check
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized - admin access required' });
    }

    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({ error: 'Status or payment status required' });
    }

    const supabase = getSupabaseAdmin();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (paymentStatus === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('partnership_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating request:', error);
      return res.status(500).json({ error: 'Failed to update request' });
    }

    res.json({ success: true, request: data });
  } catch (error: any) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

export default router;
