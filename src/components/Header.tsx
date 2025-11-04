import { Bell, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';
import { NotificationsModal } from '@/components/NotificationsModal';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export const Header = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 lg:left-[280px] h-16 z-30 px-6',
        'flex items-center justify-end gap-4',
        isDark ? 'glass-dark' : 'glass'
      )}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'hover:bg-ncsBlue-500/20 hover:border-ncsBlue-500/50',
          'border border-transparent'
        )}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} className="text-ncsBlue-400" /> : <Moon size={20} className="text-ncsBlue-600" />}
      </button>

      {/* Notifications */}
      <button
        className={cn(
          'p-2 rounded-lg transition-all duration-200 relative',
          'hover:bg-ncsBlue-500/20 hover:border-ncsBlue-500/50',
          'border border-transparent'
        )}
        aria-label="Notifications"
        onClick={() => setShowNotifications(true)}
      >
        <Bell size={20} />
        {user?.hasPendingInvitation && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-brightPink-500 rounded-full"></span>
        )}
      </button>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg transition-all duration-200',
            'hover:bg-ncsBlue-500/20 hover:border-ncsBlue-500/50',
            'border border-transparent'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-ncsBlue-500/30 flex items-center justify-center">
            <User size={18} />
          </div>
          <span className="hidden md:block text-sm font-medium">
            {user?.name || 'User'}
          </span>
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'absolute right-0 mt-2 w-48 rounded-xl shadow-lg',
                isDark ? 'glass-dark' : 'glass',
                'border border-ncsBlue-500/20 overflow-hidden'
              )}
            >
              <div className="p-2">
                <div className="px-4 py-2 border-b border-ncsBlue-500/20">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-ncsBlue-500/20 rounded-lg transition-colors text-left"
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to settings if available
                  }}
                >
                  <Settings size={16} />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-left"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </header>
  );
};

