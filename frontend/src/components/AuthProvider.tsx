import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rehydrateAuth, logout } from '../store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {
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
        } else {
          // Token is invalid, log out
          dispatch(logout());
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // On error, log out to be safe
        dispatch(logout());
      }
    };

    verifyToken();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
