import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Building2,
  Users,
  TrendingUp,
  Mail,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Here you would normally send the email to your backend
      setIsSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Search Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent">
              Find Your College Org to Partner With
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover 5,000+ Greek organizations across 250+ universities. Be the first to know when we launch.
            </p>
          </motion.div>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit}>
                <div className={`relative bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
                  isFocused ? 'ring-4 ring-green-200 transform scale-105' : 'hover:shadow-3xl'
                }`}>
                  <div className="flex items-center p-2">
                    <div className="flex items-center justify-center w-12 h-12 ml-2">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email to join the waitlist..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="flex-1 px-4 py-6 text-lg focus:outline-none placeholder-gray-400"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white mr-2 px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                    >
                      Join Waitlist
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Early Access Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    EARLY ACCESS
                  </span>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h3>
                <p className="text-gray-600">We'll notify you when Fraternity Base launches.</p>
              </div>
            )}
          </motion.div>


          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-white/80 transition">
              <div className="flex justify-center mb-3">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">5,000+</div>
              <div className="text-gray-600">Greek Organizations</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-white/80 transition">
              <div className="flex justify-center mb-3">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">250+</div>
              <div className="text-gray-600">Universities</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-white/80 transition">
              <div className="flex justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600">Match Accuracy</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;