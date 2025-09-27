import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Search, Users, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Fraternity Base"
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback if logo not found
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-bold text-gray-900">Fraternity Base</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/browse"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/browse')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse
            </Link>

            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/pricing')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Pricing
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>

            <div className="flex items-center gap-3 ml-4">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/browse"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/browse')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              Browse Organizations
            </Link>

            <Link
              to="/pricing"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/pricing')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            <Link
              to="/about"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Log In
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;