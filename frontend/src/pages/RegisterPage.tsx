import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../store/api/apiSlice';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data).unwrap();
      navigate('/login');
    } catch (err: any) {
      setError(err.data?.message || 'Registration failed. Please try again.');
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
          <div className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            🚀 Coming Soon
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Join the Waitlist</h2>
          <p className="mt-2 text-sm text-gray-600">
            Registration is temporarily closed. Join our waitlist for early access!
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 opacity-60 pointer-events-none">
          <div className="space-y-6">
            <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-md text-sm text-center">
              Registration is temporarily closed while we prepare for launch
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label text-gray-500">
                  First name
                </label>
                <input
                  type="text"
                  className="input bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="lastName" className="label text-gray-500">
                  Last name
                </label>
                <input
                  type="text"
                  className="input bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label text-gray-500">
                Email address
              </label>
              <input
                type="email"
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label htmlFor="companyName" className="label text-gray-500">
                Company name
              </label>
              <input
                type="text"
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label htmlFor="position" className="label text-gray-500">
                Position
              </label>
              <input
                type="text"
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label htmlFor="password" className="label text-gray-500">
                Password
              </label>
              <input
                type="password"
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label text-gray-500">
                Confirm password
              </label>
              <input
                type="password"
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
            >
              Registration Closed
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg"
          >
            Join Our Waitlist Instead →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;