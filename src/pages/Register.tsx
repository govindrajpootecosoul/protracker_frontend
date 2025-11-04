import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { GlassCard } from '@/components/GlassCard';
import { cn } from '@/utils/cn';
import type { RegisterData } from '@/types';

export const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { isDark } = useThemeStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>();

  const onSubmit = async (data: RegisterData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        navigate('/');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100')}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="ncsBlue" className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ncsBlue-500/20 flex items-center justify-center">
              <UserPlus size={32} className="text-ncsBlue-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Sign up to get started</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-left">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    errors.name ? 'border-red-500' : 'border-ncsBlue-500/30',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter your name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-left">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    errors.email ? 'border-red-500' : 'border-ncsBlue-500/30',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-left">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    errors.password ? 'border-red-500' : 'border-ncsBlue-500/30',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-lg font-semibold transition-all duration-200',
                'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
                'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'btn-glass'
              )}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-ncsBlue-500 hover:text-ncsBlue-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

