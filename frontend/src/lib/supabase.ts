import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Storage adapter for localStorage
    storage: window.localStorage,
  },
});

// Auto-refresh session on user activity to prevent logout during testing
let lastActivity = Date.now();
const ACTIVITY_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh every 5 minutes of activity

const refreshSessionOnActivity = () => {
  const now = Date.now();
  if (now - lastActivity > ACTIVITY_REFRESH_INTERVAL) {
    console.log('🔄 Refreshing session due to user activity');
    supabase.auth.refreshSession();
    lastActivity = now;
  }
};

// Track user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, () => {
    lastActivity = Date.now();
  }, { passive: true });
});

// Check and refresh session every minute if user has been active
setInterval(refreshSessionOnActivity, 60 * 1000);

// Database types
export interface Profile {
  id: string;
  user_id: string;
  company_id?: string;
  role: 'admin' | 'user' | 'viewer';
  subscription_tier: 'free_trial' | 'starter' | 'growth' | 'pro' | 'enterprise';
  trial_lookups_used: number;
  trial_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  greek_letters: string;
  university: string;
  member_count: number;
  engagement_score: number;
  instagram_handle?: string;
  contact_email?: string;
  partnership_openness: 'open' | 'selective' | 'closed';
}

export interface ContactRequest {
  id: string;
  user_id: string;
  chapter_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  response?: string;
  created_at: string;
  responded_at?: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action_type: 'chapter_lookup' | 'contact_request' | 'export';
  resource_id?: string;
  metadata?: any;
  created_at: string;
}