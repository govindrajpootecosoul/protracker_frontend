import { useState, useEffect } from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import { brandService } from '@/services/brandService';
import { projectService } from '@/services/projectService';
import { useQuery } from '@tanstack/react-query';

interface InviteModalProps {
  onClose: () => void;
  onInvite: (email: string, brandIds: string[], projectIds: string[]) => Promise<void>;
  isInviting?: boolean;
}

export const InviteModal = ({ onClose, onInvite, isInviting = false }: InviteModalProps) => {
  const { isDark } = useThemeStore();
  const [email, setEmail] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectAllBrands, setSelectAllBrands] = useState(false);
  const [selectAllProjects, setSelectAllProjects] = useState(true); // Default to "All" selected

  // Fetch brands
  const { data: brandsResponse } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandService.getAll();
      return response.data || [];
    },
  });

  // Fetch all projects from selected brands
  const { data: projectsResponse } = useQuery({
    queryKey: ['all-projects-for-invite', selectedBrandIds],
    queryFn: async () => {
      if (selectedBrandIds.length === 0) return [];
      
      // Fetch projects for all selected brands
      const promises = selectedBrandIds.map(brandId => 
        projectService.getByBrand(brandId).then(res => res.data || [])
      );
      
      const allProjects = await Promise.all(promises);
      return allProjects.flat();
    },
    enabled: selectedBrandIds.length > 0,
  });

  const brands = brandsResponse || [];
  const allProjects = projectsResponse || [];

  // Update selected projects when selectAllProjects changes
  useEffect(() => {
    if (selectAllProjects && allProjects.length > 0) {
      // Select all projects
      setSelectedProjectIds(allProjects.map((p: any) => p._id));
    } else if (selectAllProjects === false && selectedProjectIds.length === allProjects.length) {
      // If user unchecks "All", clear all
      setSelectedProjectIds([]);
    }
  }, [selectAllProjects]);

  // Update selectAllProjects when selectedProjectIds changes
  useEffect(() => {
    if (allProjects.length > 0) {
      const allSelected = selectedProjectIds.length === allProjects.length;
      if (allSelected !== selectAllProjects) {
        setSelectAllProjects(allSelected);
      }
    }
  }, [selectedProjectIds.length, allProjects.length]);

  // Update selected brands when selectAllBrands changes
  useEffect(() => {
    if (selectAllBrands && brands.length > 0) {
      setSelectedBrandIds(brands.map((b: any) => b._id));
    } else if (selectAllBrands === false && selectedBrandIds.length === brands.length) {
      setSelectedBrandIds([]);
    }
  }, [selectAllBrands]);

  // Update selectAllBrands when selectedBrandIds changes
  useEffect(() => {
    if (brands.length > 0) {
      const allSelected = selectedBrandIds.length === brands.length;
      if (allSelected !== selectAllBrands) {
        setSelectAllBrands(allSelected);
      }
    }
  }, [selectedBrandIds.length, brands.length]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrandIds(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (selectedBrandIds.length === 0) {
      alert('Please select at least one brand');
      return;
    }

    if (selectedProjectIds.length === 0 && !selectAllProjects) {
      alert('Please select at least one project or select "All"');
      return;
    }

    // If "All Projects" is selected, send empty array (backend will handle all projects)
    const projectIdsToSend = selectAllProjects ? [] : selectedProjectIds;

    try {
      await onInvite(email.trim(), selectedBrandIds, projectIdsToSend);
      setEmail('');
      setSelectedBrandIds([]);
      setSelectedProjectIds([]);
      setSelectAllBrands(false);
      setSelectAllProjects(true);
    } catch (error) {
      // Error handled by parent
    }
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
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold">Invite Member</h2>
              <button
                onClick={onClose}
                className={cn('p-2 rounded-lg hover:bg-ncsBlue-500/20 transition-colors')}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter email address"
                />
              </div>

              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Brands</label>
                <div className={cn(
                  'border rounded-xl p-4 max-h-64 overflow-y-auto',
                  isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50/50'
                )}>
                  {/* All Brands Option */}
                  <label
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2',
                      selectAllBrands
                        ? 'bg-ncsBlue-500/20 border border-ncsBlue-500/50'
                        : 'hover:bg-white/10 border border-transparent'
                    )}
                    onClick={() => setSelectAllBrands(!selectAllBrands)}
                  >
                    {selectAllBrands ? (
                      <CheckSquare size={20} className="text-ncsBlue-500" />
                    ) : (
                      <Square size={20} className="text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">All Brands</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Select all {brands.length} brands</div>
                    </div>
                  </label>

                  {/* Individual Brands */}
                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                    {brands.map((brand: any) => (
                      <label
                        key={brand._id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                          selectedBrandIds.includes(brand._id)
                            ? 'bg-ncsBlue-500/20 border border-ncsBlue-500/50'
                            : 'hover:bg-white/10 border border-transparent'
                        )}
                        onClick={() => toggleBrand(brand._id)}
                      >
                        {selectedBrandIds.includes(brand._id) ? (
                          <CheckSquare size={18} className="text-ncsBlue-500" />
                        ) : (
                          <Square size={18} className="text-gray-400" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{brand.name}</div>
                          {brand.description && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{brand.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                  {selectedBrandIds.length > 0 
                    ? `Selected ${selectedBrandIds.length} brand(s)`
                    : 'No brands selected'}
                </p>
              </div>

              {/* Project Selection */}
              {selectedBrandIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Select Projects</label>
                  <div className={cn(
                    'border rounded-xl p-4 max-h-64 overflow-y-auto',
                    isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50/50'
                  )}>
                    {/* All Projects Option */}
                    <label
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2',
                        selectAllProjects
                          ? 'bg-emerald-500/20 border border-emerald-500/50'
                          : 'hover:bg-white/10 border border-transparent'
                      )}
                      onClick={() => setSelectAllProjects(!selectAllProjects)}
                    >
                      {selectAllProjects ? (
                        <CheckSquare size={20} className="text-emerald-500" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">All Projects</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {allProjects.length > 0 
                            ? `Select all ${allProjects.length} projects from selected brands`
                            : 'No projects found in selected brands'}
                        </div>
                      </div>
                    </label>

                    {/* Individual Projects */}
                    {allProjects.length > 0 && (
                      <div className="space-y-2 border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                        {allProjects.map((project: any) => (
                          <label
                            key={project._id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                              selectedProjectIds.includes(project._id)
                                ? 'bg-emerald-500/20 border border-emerald-500/50'
                                : 'hover:bg-white/10 border border-transparent'
                            )}
                            onClick={() => toggleProject(project._id)}
                          >
                            {selectedProjectIds.includes(project._id) ? (
                              <CheckSquare size={18} className="text-emerald-500" />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                              {project.brandId?.name && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">Brand: {project.brandId.name}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                    {selectAllProjects 
                      ? `All projects (${allProjects.length}) will be accessible`
                      : selectedProjectIds.length > 0
                        ? `Selected ${selectedProjectIds.length} project(s)`
                        : 'No projects selected'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                  disabled={isInviting || selectedBrandIds.length === 0}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg font-semibold transition-all',
                    'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
                    'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed btn-glass'
                  )}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
