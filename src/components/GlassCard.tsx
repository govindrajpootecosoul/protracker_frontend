import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'ncsBlue' | 'solid';
}

export const GlassCard = ({ children, className, onClick, variant = 'default' }: GlassCardProps) => {
  const { isDark } = useThemeStore();

  const baseStyles = `
    rounded-2xl p-6 transition-all duration-300
    ${variant === 'solid' ? '' : (isDark ? 'glass-dark' : 'glass')}
    ${variant === 'ncsBlue' ? 'border-ncsBlue-500/30' : ''}
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(baseStyles, className)}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
    >
      {children}
    </motion.div>
  );
};

