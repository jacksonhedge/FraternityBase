import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Building2,
  Users,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/chapters?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularSearches = [
    'Sigma Chi chapters',
    'Sororities at SEC schools',
    'Business fraternities',
    'Engineering organizations',
    'Top chapters by engagement'
  ];

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
              Discover 5,000+ Greek organizations across 250+ universities with AI-powered search
            </p>
          </motion.div>

          {/* AI Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className={`relative bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
              isSearchFocused ? 'ring-4 ring-primary-200 transform scale-105' : 'hover:shadow-3xl'
            }`}>
              <div className="flex items-center p-2">
                <div className="flex items-center justify-center w-12 h-12 ml-2">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>
                <input
                  type="text"
                  placeholder="Try 'Top business fraternities at SEC schools' or 'Sororities with 150+ members'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 px-4 py-6 text-lg focus:outline-none placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="btn-primary mr-2 px-8 py-4 text-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </div>

            {/* AI Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                AI-POWERED
              </span>
            </div>
          </motion.form>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-sm hover:bg-white hover:text-primary-600 transition-all hover:scale-105 shadow-md"
                >
                  {search}
                </button>
              ))}
            </div>
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