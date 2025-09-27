import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, companyName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkLookupLimit: () => Promise<boolean>;
  incrementLookupCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, companyName: string) => {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName
          }
        }
      });

      if (authError) throw authError;

      // Create company record
      if (authData.user) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            company_id: company.id,
            role: 'user',
            subscription_tier: 'free_trial',
            trial_lookups_used: 0,
            trial_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const checkLookupLimit = async () => {
    if (!profile) return false;

    // Admins have unlimited lookups
    if (profile.role === 'admin') return true;

    // Check subscription tier limits
    const limits = {
      free_trial: 1,
      starter: 10,
      growth: 50,
      pro: Infinity,
      enterprise: Infinity
    };

    const limit = limits[profile.subscription_tier];

    // For free trial, check total usage
    if (profile.subscription_tier === 'free_trial') {
      return profile.trial_lookups_used < limit;
    }

    // For paid tiers, check monthly usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('action_type', 'chapter_lookup')
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error checking usage:', error);
      return false;
    }

    return (count || 0) < limit;
  };

  const incrementLookupCount = async () => {
    if (!user || !profile) return;

    // Log the usage
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user.id,
        action_type: 'chapter_lookup',
        created_at: new Date().toISOString()
      });

    // Update trial lookups if on free trial
    if (profile.subscription_tier === 'free_trial') {
      await supabase
        .from('user_profiles')
        .update({ trial_lookups_used: profile.trial_lookups_used + 1 })
        .eq('user_id', user.id);

      // Update local profile
      setProfile({
        ...profile,
        trial_lookups_used: profile.trial_lookups_used + 1
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        checkLookupLimit,
        incrementLookupCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};