import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { brandService } from '@/services/brandService';
import { GlassCard } from './GlassCard';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { departmentService } from '@/services/departmentService';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import type { Brand } from '@/types';

interface BrandModalProps {
  brand: Brand | null;
  onClose: () => void;
}

export const BrandModal = ({ brand, onClose }: BrandModalProps) => {
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const queryClient = useQueryClient();

  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  // Fetch companies and departments from User table
  const { data: companies, isLoading: companiesLoading, error: companiesError } = useQuery({ 
    queryKey: ['companies'], 
    queryFn: async () => {
      const response = await companyService.list();
      return response.data;
    }, 
    enabled: !!isAdmin 
  });
  const { data: departments, isLoading: departmentsLoading, error: departmentsError } = useQuery({ 
    queryKey: ['departments', company], 
    queryFn: async () => {
      const response = await departmentService.list(company || undefined);
      return response.data;
    }, 
    enabled: !!isAdmin && !!company 
  });
  
  // Debug logging (remove in production)
  if (import.meta.env.MODE === 'development') {
    console.log('BrandModal - isSuperadmin:', isSuperadmin, 'isAdmin:', isAdmin, 'user role:', user?.role);
    console.log('BrandModal - companies:', companies, 'companiesLoading:', companiesLoading, 'companiesError:', companiesError);
    console.log('BrandModal - departments:', departments, 'departmentsLoading:', departmentsLoading, 'departmentsError:', departmentsError);
  }

  useEffect(() => {
    if (brand) {
      setName(brand.name || '');
      setDescription(brand.description || '');
      setCompany(brand.company || '');
      setDepartment(brand.department || '');
    } else {
      setName('');
      setDescription('');
      setCompany('');
      setDepartment('');
    }
  }, [brand]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; description?: string; company?: string; department?: string }) => {
      if (brand) {
        return brandService.update(brand._id, data);
      }
      return brandService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Superadmin must provide company and department
    if (isSuperadmin && (!company || !department)) {
      alert('Please select both company and department');
      return;
    }
    // Admin doesn't need to provide - backend will auto-set from their user record
    const payload: any = { name, description };
    if (isSuperadmin) {
      payload.company = company;
      payload.department = department;
    }
    // For admin, backend will automatically use their company and department
    // So we don't send company/department in the payload for admin
    mutation.mutate(payload);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {brand ? 'Edit Brand' : 'Create Brand'}
              </h2>
              <button
                onClick={onClose}
                className={cn('p-2 rounded-lg hover:bg-ncsBlue-500/20 transition-colors')}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter brand description"
                />
              </div>

              {isSuperadmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <select
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        setDepartment(''); // Reset department when company changes
                      }}
                      className={cn('w-full px-4 py-3 rounded-lg border', isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300')}
                    >
                      <option value="">Select company</option>
                      {Array.isArray(companies) && companies.map((c: any) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={!company}
                      className={cn('w-full px-4 py-3 rounded-lg border', isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300', !company && 'opacity-50 cursor-not-allowed')}
                    >
                      <option value="">{company ? 'Select department' : 'Select company first'}</option>
                      {Array.isArray(departments) && departments.map((d: any) => (
                        <option key={d._id || d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {user?.role === 'admin' && !isSuperadmin && (
                <div className={cn(
                  'p-3 rounded-lg text-sm font-medium',
                  'bg-black/50 border border-ncsBlue-500/30',
                  'text-white'
                )}>
                  ℹ️ Brand will be created for your company ({user.company}) and department ({user.department})
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg font-semibold transition-colors',
                    'bg-gray-500/20 text-gray-700 dark:text-gray-300 hover:bg-gray-500/30'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg font-semibold transition-all',
                    'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
                    'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed btn-glass'
                  )}
                >
                  {mutation.isPending ? 'Saving...' : brand ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

