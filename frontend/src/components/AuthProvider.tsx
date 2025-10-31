import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rehydrateAuth, logout } from '../store/slices/authSlice';
import { analytics } from '../services/analytics';
import { supabase } from '../lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (!token) {
        return;
      }

      try {
        // Get current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          dispatch(logout());
          return;
        }

        const userId = session.user.id;
        const email = session.user.email || '';

        // Check if fraternity user
        if (userType === 'fraternity') {
          const { data: fraternityUser, error: fraternityError } = await supabase
            .from('fraternity_users')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (fraternityError || !fraternityUser) {
            console.error('Fraternity user not found:', fraternityError);
            dispatch(logout());
            return;
          }

          // Rehydrate auth state with fraternity user data
          dispatch(rehydrateAuth({
            user: {
              id: userId,
              email: email,
              firstName: fraternityUser.first_name || '',
              lastName: fraternityUser.last_name || '',
              role: 'user' as const,
            },
            token: token
          }));

          // Set analytics user context
          analytics.setUser(userId, null, email, null);
        } else {
          // Brand user - use existing API endpoint
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Rehydrate auth state with user data from token verification
            dispatch(rehydrateAuth({
              user: data.user,
              token: token
            }));

            // Set analytics user context
            analytics.setUser(
              data.user.id,
              data.user.companyId,
              data.user.email,
              data.user.companyName || null
            );
          } else {
            // Token is invalid, log out
            dispatch(logout());
            // Clear analytics user context
            analytics.setUser(null, null, null, null);
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // On error, log out to be safe
        dispatch(logout());
      }
    };

    // Verify token immediately on mount
    verifyToken();

    // Keep session alive by verifying token every 10 minutes
    // This prevents logout during active testing/usage
    const keepAliveInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔄 Keeping session alive...');
        verifyToken();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(keepAliveInterval);
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
