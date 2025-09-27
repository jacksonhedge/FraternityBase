import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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