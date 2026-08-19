import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

export const UserProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'EMPLOYEE') return '/employee/dashboard';
    return '/user/dashboard';
  };

  const getProfilePath = () => {
    if (user.role === 'ADMIN') return '/admin/settings';
    if (user.role === 'EMPLOYEE') return '/employee/profile';
    return '/user/profile';
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-100 transition-all border border-cream-200"
      >
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="hidden sm:block text-left pr-2">
          <p className="text-xs font-bold text-primary-800 leading-tight">{user.name}</p>
          <p className="text-[9px] font-semibold text-gold-600 uppercase tracking-widest leading-none mt-0.5">{user.role}</p>
        </div>
        <ChevronDown size={14} className="text-gray-400 mr-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-luxury border border-cream-100 bg-white py-2 shadow-luxury z-50">
          <div className="px-4 py-2 border-b border-cream-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-bold text-primary-800 truncate mt-0.5">{user.name}</p>
            <p className="text-[10px] text-gray-400 truncate font-mono">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate(getDashboardPath());
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 text-left"
          >
            <Shield size={14} className="text-gold-500" /> Dashboard
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate(getProfilePath());
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary-800 hover:bg-cream-50 text-left"
          >
            <UserIcon size={14} className="text-gold-500" /> Profile Settings
          </button>
          <div className="border-t border-cream-100 mt-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
