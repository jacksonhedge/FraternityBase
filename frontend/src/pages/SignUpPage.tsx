import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Building2, Mail, User, FileText, ArrowRight, Check, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loginSuccess } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';

const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    companyDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companyDescription.trim()) {
      newErrors.companyDescription = 'Company description is required';
    } else if (formData.companyDescription.length < 20) {
      newErrors.companyDescription = 'Please provide at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setErrors({ email: signUpError.message });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrors({ email: 'Failed to create account. Please try again.' });
        setIsLoading(false);
        return;
      }

      // 2. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          description: formData.companyDescription,
        })
        .select()
        .single();

      if (companyError || !company) {
        console.error('Company creation error:', companyError);
        setErrors({ companyName: 'Failed to create company. Please try again.' });
        setIsLoading(false);
        return;
      }

      // 3. Create user_profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          company_id: company.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'admin', // First user is admin
          subscription_tier: 'free_trial',
          trial_lookups_used: 0,
          trial_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setErrors({ email: 'Failed to create user profile. Please try again.' });
        setIsLoading(false);
        return;
      }

      // 4. Initialize account balance (with $50 starting balance)
      const { error: balanceError } = await supabase
        .from('account_balance')
        .insert({
          company_id: company.id,
          balance_dollars: 50.00,
          lifetime_spent_dollars: 0.00,
          lifetime_added_dollars: 50.00,
        });

      if (balanceError) {
        console.error('Balance initialization error:', balanceError);
        // Don't fail signup if balance init fails - can be fixed later
      }

      // 5. Auto-unlock a five-star chapter as a welcome gift (disabled for now)
      // TODO: Re-enable once chapter_unlocks table is properly configured
      // try {
      //   const { data: fiveStarChapters, error: chapterError } = await supabase
      //     .from('chapters')
      //     .select('id, chapter_name, universities(name)')
      //     .eq('five_star_rating', true)
      //     .limit(10);
      //
      //   if (!chapterError && fiveStarChapters && fiveStarChapters.length > 0) {
      //     const randomChapter = fiveStarChapters[Math.floor(Math.random() * fiveStarChapters.length)];
      //
      //     await supabase
      //       .from('chapter_unlocks')
      //       .insert({
      //         company_id: company.id,
      //         chapter_id: randomChapter.id,
      //         unlock_type: 'full_contacts',
      //         credits_spent: 0,
      //       });
      //
      //     console.log(`🎁 Welcome gift: Unlocked ${randomChapter.chapter_name} for free!`);
      //   }
      // } catch (error) {
      //   console.error('Failed to unlock five-star chapter:', error);
      // }

      // 6. Auto-login after successful signup
      console.log('Auth data from signup:', authData);

      // Check if we have a session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData, 'Session error:', sessionError);

      if (sessionData?.session || authData.session) {
        const session = sessionData?.session || authData.session;

        // Store token
        localStorage.setItem('token', session.access_token);

        // Get the profile and company status
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*, companies(name, approval_status)')
          .eq('user_id', authData.user.id)
          .single();

        console.log('Profile data:', profile, 'Profile error:', profileError);

        if (profile) {
          // Dispatch to Redux
          dispatch(loginSuccess({
            user: {
              id: authData.user.id,
              email: authData.user.email || '',
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              role: profile.role || 'user',
              companyId: profile.company_id,
              companyName: profile.companies?.name
            },
            token: session.access_token
          }));

          console.log('Signup successful! Auto-logged in, redirecting to dashboard...');
          navigate('/app/dashboard');
        } else {
          console.log('Profile not found, redirecting to login...');
          navigate('/login');
        }
      } else {
        // No session - email confirmation may be required
        console.log('No session available. Email confirmation may be required.');
        alert('Account created! Please check your email to confirm your account, then log in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Get started with 10 free chapter unlocks
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">No credit card required</span> for your free trial.
                  Explore our platform and see how we can help you connect with Greek organizations.
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Company Name Field */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              {/* Company Description Field */}
              <div>
                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  What does your company do?
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    id="companyDescription"
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    placeholder="We're a marketing agency looking to partner with Greek organizations for brand campaigns..."
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.companyDescription ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.companyDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyDescription}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-center text-gray-500 mt-4">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;