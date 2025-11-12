/**
 * ProfileMenu Component
 * Dropdown menu for user profile with My Brands section
 */

import { User, Heart, MessageCircle, Settings, LogOut, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onOpenMessages: () => void;
}

export default function ProfileMenu({
  isOpen,
  onClose,
  userName = 'User',
  onOpenMessages
}: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-lg overflow-hidden z-50"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        border: '1px solid',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* User Info Section */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ color: 'var(--text)' }}
            >
              {userName}
            </div>
            <div
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Fraternity Member
            </div>
          </div>
        </div>
      </div>

      {/* My Brands Section */}
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="text-xs font-semibold mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          MY BRANDS
        </div>
        <div
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-standard hover:shadow-sm"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)',
              color: 'white'
            }}
          >
            P
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              ProphetX
            </div>
            <div
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <Star size={10} fill="currentColor" />
              Featured Partner
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={onOpenMessages}
          className="w-full flex items-center gap-3 px-4 py-3 transition-standard hover:opacity-80"
          style={{ backgroundColor: 'transparent', color: 'var(--text)' }}
        >
          <MessageCircle size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium">Messages</span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
          >
            1
          </span>
        </button>

        <button
          className="w-full flex items-center gap-3 px-4 py-3 transition-standard hover:opacity-80"
          style={{ backgroundColor: 'transparent', color: 'var(--text)' }}
        >
          <Heart size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium">Favorites</span>
        </button>

        <button
          className="w-full flex items-center gap-3 px-4 py-3 transition-standard hover:opacity-80"
          style={{ backgroundColor: 'transparent', color: 'var(--text)' }}
        >
          <Settings size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>

      {/* Logout */}
      <div
        className="border-t p-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-standard"
          style={{ backgroundColor: 'transparent', color: 'var(--danger)' }}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
