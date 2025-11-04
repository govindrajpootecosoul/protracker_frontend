import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className={cn('min-h-screen transition-colors', isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100')}>
      <Sidebar />
      <Header />
      <main className="lg:ml-[280px] mt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

