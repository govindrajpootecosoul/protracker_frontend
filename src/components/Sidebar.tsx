import { NavLink } from 'react-router-dom';
import { Home, Building2, FolderKanban, CheckSquare, Users, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const getAllMenuItems = (userRole?: string) => {
  const baseItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/brands', label: 'Brands', icon: Building2 },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { path: '/team', label: 'Team Management', icon: Users },
  ];

  // Add Send Tasks Email for superadmin and admin only
  if (userRole === 'superadmin' || userRole === 'admin') {
    baseItems.push({ path: '/send-tasks-email', label: 'Send Tasks Email', icon: Mail });
  }

  return baseItems;
};

export const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const menuItems = getAllMenuItems(user?.role);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-ncsBlue"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed left-0 top-0 h-screen w-[280px] z-40 p-6',
            'lg:translate-x-0 transition-transform duration-300',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            isDark ? 'glass-dark' : 'glass'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
                Project Tracker
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        'hover:bg-ncsBlue-500/20 hover:border-ncsBlue-500/50',
                        isActive
                          ? 'bg-ncsBlue-500/30 border border-ncsBlue-500/50 text-ncsBlue-300'
                          : 'text-gray-700 dark:text-gray-300',
                        isDark && 'text-gray-300'
                      )
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Mobile Overlay */}
          {isMobileOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

