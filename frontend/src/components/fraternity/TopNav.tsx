/**
 * TopNav Component
 * Clean top navigation bar with tabs (Impact.com style)
 */

import { Search, Heart, User, Bell } from 'lucide-react';
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';

type Tab = 'home' | 'all-brands' | 'pre-approved' | 'new' | 'favorites';

interface TopNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userName?: string;
  notificationCount?: number;
  onOpenMessages: () => void;
}

export default function TopNav({
  activeTab,
  onTabChange,
  userName,
  notificationCount = 0,
  onOpenMessages
}: TopNavProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'all-brands', label: 'All Brands' },
    { id: 'pre-approved', label: 'Pre-approved' },
    { id: 'new', label: 'New' },
    { id: 'favorites', label: 'Favorites' }
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

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-4 py-2 rounded-lg font-medium text-sm transition-standard whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                backgroundColor: activeTab === tab.id ? 'var(--muted)' : 'transparent'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-springy"
                  style={{ backgroundColor: 'var(--brand)' }}
                />
              )}
            </button>
          ))}
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
          <div className="relative">
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

            {/* Profile Menu */}
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
              userName={userName}
              onOpenMessages={() => {
                setIsProfileMenuOpen(false);
                onOpenMessages();
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Tabs (Below Nav) */}
      <div className="md:hidden border-t overflow-x-auto scrollbar-hide" style={{ borderColor: 'var(--border)' }}>
        <div className="flex px-4 gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-4 py-3 font-medium text-sm transition-standard whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-springy"
                  style={{ backgroundColor: 'var(--brand)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
