import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { loginSuccess, loginFailure } from '../store/slices/authSlice';
import { Eye, EyeOff, Loader2, Building2, Heart, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  // const [login, { isLoading }] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idleMessage, setIdleMessage] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<'brand' | 'fraternity' | 'ambassador'>('brand');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check for idle logout message
  useEffect(() => {
    if (searchParams.get('reason') === 'idle') {
      setIdleMessage('You were automatically signed out due to inactivity.');
      // Clear the URL parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('reason');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    // Check if ambassador
    if (accountType === 'ambassador') {
      setError('Ambassador login is not available yet. Please check back soon!');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Login error:', authError);
        setError(authError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (!authData.user || !authData.session) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check if user is a fraternity user first
      const { data: fraternityUser, error: fraternityError } = await supabase
        .from('fraternity_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      // If fraternity user found
      if (fraternityUser && !fraternityError) {
        // Check if they selected the right account type
        if (accountType !== 'fraternity') {
          setError('This email is registered as a fraternity account. Please select "Fraternity/Sorority" to login.');
          setIsLoading(false);
          return;
        }
        // Check approval status
        if (fraternityUser.approval_status === 'rejected') {
          setError(`Your application was rejected. Reason: ${fraternityUser.rejection_reason || 'Please contact support for more information.'}`);
          setIsLoading(false);
          return;
        }

        if (fraternityUser.approval_status === 'pending') {
          setError('Your account is pending approval. Please check back later.');
          setIsLoading(false);
          return;
        }

        // Store token in localStorage for API calls
        localStorage.setItem('token', authData.session.access_token);
        localStorage.setItem('userType', 'fraternity');

        // Dispatch to Redux with fraternity user data
        dispatch(loginSuccess({
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            firstName: fraternityUser.first_name || '',
            lastName: fraternityUser.last_name || '',
            role: 'user',
          },
          token: authData.session.access_token
        }));

        // Navigate to fraternity dashboard
        setTimeout(() => {
          navigate('/fraternity/dashboard');
        }, 0);
        return;
      }

      // Otherwise, check for brand user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*, companies(name, approval_status)')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setError('Account not found. Please make sure you selected the correct account type.');
        setIsLoading(false);
        return;
      }

      // Check if they selected the right account type
      if (accountType !== 'brand') {
        setError('This email is registered as a brand account. Please select "Brand/Business" to login.');
        setIsLoading(false);
        return;
      }

      // Check if company is rejected
      if (profile?.companies?.approval_status === 'rejected') {
        setError('Your company application was not approved. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Store token in localStorage for API calls
      localStorage.setItem('token', authData.session.access_token);
      localStorage.setItem('userType', 'brand');

      // Dispatch to Redux with real user data
      dispatch(loginSuccess({
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          role: profile?.role || 'user',
          companyId: profile?.company_id,
          companyName: profile?.companies?.name
        },
        token: authData.session.access_token
      }));

      // Wait a tick for Redux state to update before navigating
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 0);
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/fb-logo.svg" alt="FB" className="w-14 h-14" />
            <h1 className="text-4xl font-bold text-gray-900">FraternityBase</h1>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="space-y-6">
              {idleMessage && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                  {idleMessage}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am signing in as a:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('brand')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      accountType === 'brand'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="text-xs font-medium">Brand</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('fraternity')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      accountType === 'fraternity'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Heart className="w-6 h-6" />
                    <span className="text-xs font-medium">Fraternity</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('ambassador')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      accountType === 'ambassador'
                        ? 'border-green-600 bg-green-50 text-green-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-medium">Ambassador</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="input"
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.password.message)}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;