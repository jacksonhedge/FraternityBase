/**
 * BusinessTopNav Component
 * Clean top navigation bar for business/brand dashboard (Impact.com/Sandlot style)
 */

import { MapPin, GraduationCap, Building2, ChevronDown, Bell, User, Unlock, Handshake, Briefcase, Store } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BusinessTopNavProps {
  userName?: string;
  notificationCount?: number;
  unlockedChaptersCount?: number;
}

export default function BusinessTopNav({
  userName,
  notificationCount = 0,
  unlockedChaptersCount = 0
}: BusinessTopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMyChaptersOpen, setIsMyChaptersOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const myChaptersRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (myChaptersRef.current && !myChaptersRef.current.contains(event.target as Node)) {
        setIsMyChaptersOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const myChaptersItems = [
    {
      label: 'My Chapters',
      path: '/app/my-unlocked',
      icon: Unlock,
      badge: unlockedChaptersCount > 0 ? unlockedChaptersCount : null
    },
    { label: 'Requested Introductions', path: '/app/requested-introductions', icon: Handshake },
    { label: 'My Ambassadors', path: '/app/my-ambassadors', icon: Briefcase, badge: 'SOON' },
  ];

  return (
    <nav
      className="sticky top-0 z-40 border-b transition-standard"
      style={{
        height: 'var(--nav-height)',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="max-w-[var(--max-width-lg)] mx-auto h-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-8">

        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            FraternityBase
          </h1>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-2xl">
          {/* My Listings - Primary CTA */}
          <button
            onClick={() => navigate('/app/my-listings')}
            className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/my-listings')
                ? 'shadow-md'
                : 'hover:shadow-md'
            }`}
            style={{
              backgroundColor: isActive('/app/my-listings') ? 'var(--brand)' : 'var(--brand)',
              color: 'white'
            }}
          >
            <Store size={16} />
            My Listings
          </button>

          {/* Divider */}
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />

          {/* Map */}
          <button
            onClick={() => navigate('/app/map')}
            className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/map') ? 'bg-[var(--muted)]' : ''
            }`}
            style={{
              color: isActive('/app/map') ? 'var(--text)' : 'var(--text-muted)'
            }}
          >
            <MapPin size={16} />
            Map
            {isActive('/app/map') && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>

          {/* Fraternities */}
          <button
            onClick={() => navigate('/app/chapters')}
            className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/chapters') ? 'bg-[var(--muted)]' : ''
            }`}
            style={{
              color: isActive('/app/chapters') ? 'var(--text)' : 'var(--text-muted)'
            }}
          >
            <GraduationCap size={16} />
            Fraternities
            {isActive('/app/chapters') && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>

          {/* Colleges */}
          <button
            onClick={() => navigate('/app/colleges')}
            className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/colleges') ? 'bg-[var(--muted)]' : ''
            }`}
            style={{
              color: isActive('/app/colleges') ? 'var(--text)' : 'var(--text-muted)'
            }}
          >
            <Building2 size={16} />
            Colleges
            {isActive('/app/colleges') && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>

          {/* My Chapters Dropdown */}
          <div className="relative" ref={myChaptersRef}>
            <button
              onClick={() => setIsMyChaptersOpen(!isMyChaptersOpen)}
              className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
                location.pathname.startsWith('/app/my-') || location.pathname.startsWith('/app/requested-') ? 'bg-[var(--muted)]' : ''
              }`}
              style={{
                color: location.pathname.startsWith('/app/my-') || location.pathname.startsWith('/app/requested-') ? 'var(--text)' : 'var(--text-muted)'
              }}
            >
              My Chapters
              <ChevronDown size={14} className={`transition-transform ${isMyChaptersOpen ? 'rotate-180' : ''}`} />
              {(location.pathname.startsWith('/app/my-') || location.pathname.startsWith('/app/requested-')) && (
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-springy"
                  style={{ backgroundColor: 'var(--brand)' }}
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMyChaptersOpen && (
              <div
                className="absolute top-full mt-2 left-0 min-w-[240px] rounded-lg shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)'
                }}
              >
                {myChaptersItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMyChaptersOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
                      style={{ color: 'var(--text)' }}
                    >
                      <Icon size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{
                            backgroundColor: typeof item.badge === 'string' ? 'var(--warning)' : 'var(--brand)',
                            color: 'white'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <button
            className="relative p-2 rounded-full hover:bg-opacity-10 transition-standard"
            style={{ backgroundColor: 'transparent' }}
            aria-label="Notifications"
          >
            <Bell size={20} style={{ color: 'var(--text-muted)' }} />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 text-xs flex items-center justify-center rounded-full font-semibold"
                style={{ backgroundColor: 'var(--danger)', color: 'white' }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-opacity-10 transition-standard"
              style={{ backgroundColor: 'transparent' }}
              aria-label="Profile"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: 'var(--brand)', color: 'white' }}
              >
                {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                className="absolute top-full mt-2 right-0 w-56 rounded-lg shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)'
                }}
              >
                {/* User Info */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {userName || 'User'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Business Account
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/app/marketplace-pricing');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    Billing
                  </button>
                  <button
                    onClick={() => {
                      // Handle logout
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] transition-colors"
                    style={{ color: 'var(--danger)' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tabs (Below Nav) */}
      <div className="md:hidden border-t overflow-x-auto scrollbar-hide" style={{ borderColor: 'var(--border)' }}>
        <div className="flex px-4 gap-2 min-w-max">
          <button
            onClick={() => navigate('/app/my-listings')}
            className="relative px-4 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2"
            style={{
              backgroundColor: 'var(--brand)',
              color: 'white'
            }}
          >
            <Store size={16} />
            My Listings
          </button>

          <button
            onClick={() => navigate('/app/map')}
            className={`relative px-4 py-3 font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/map') ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <MapPin size={16} />
            Map
            {isActive('/app/map') && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>

          <button
            onClick={() => navigate('/app/chapters')}
            className={`relative px-4 py-3 font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/chapters') ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <GraduationCap size={16} />
            Fraternities
            {isActive('/app/chapters') && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>

          <button
            onClick={() => navigate('/app/colleges')}
            className={`relative px-4 py-3 font-medium text-sm transition-standard whitespace-nowrap flex items-center gap-2 ${
              isActive('/app/colleges') ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <Building2 size={16} />
            Colleges
            {isActive('/app/colleges') && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-springy"
                style={{ backgroundColor: 'var(--brand)' }}
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
