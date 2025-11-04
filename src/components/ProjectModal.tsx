import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectService } from '@/services/projectService';
import { brandService } from '@/services/brandService';
import { GlassCard } from './GlassCard';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const { isDark } = useThemeStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState('');
  const queryClient = useQueryClient();

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandService.getAll();
      return response.data || [];
    },
  });

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setBrandId(project.brandId || '');
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; brandId: string; description?: string }) => {
      if (project) {
        return projectService.update(project._id, data);
      }
      return projectService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) {
      alert('Please select a brand');
      return;
    }
    mutation.mutate({ name, brandId, description });
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
                {project ? 'Edit Project' : 'Create Project'}
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
                <label className="block text-sm font-medium mb-2">Project Name</label>
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
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                >
                  <option value="">Select a brand</option>
                  {brands?.map((brand: any) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter project description"
                />
              </div>

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
                  {mutation.isPending ? 'Saving...' : project ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

