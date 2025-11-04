import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FolderKanban, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { projectService } from '@/services/projectService';
import { brandService } from '@/services/brandService';
import { GlassCard } from '@/components/GlassCard';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import { ProjectModal } from '@/components/ProjectModal';
import { format } from 'date-fns';

export const Projects = () => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const initialBrand = searchParams.get('brandId') || 'all';
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [editingProject, setEditingProject] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandService.getAll();
      return response.data || [];
    },
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', selectedBrand],
    queryFn: async () => {
      if (selectedBrand === 'all') {
        // Get all projects by fetching from each brand
        const allProjects: any[] = [];
        const brandsData = brands || [];
        for (const brand of brandsData) {
          const response = await projectService.getByBrand(brand._id);
          if (response.data) {
            allProjects.push(...response.data);
          }
        }
        return allProjects;
      }
      const response = await projectService.getByBrand(selectedBrand);
      return response.data || [];
    },
    enabled: !!brands || selectedBrand !== 'all',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your projects across brands</p>
        </motion.div>
        <div className="flex gap-3">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-colors',
              isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
              'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
            )}
          >
            <option value="all">All Brands</option>
            {brands?.map((brand: any) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all',
              'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
              'hover:from-ncsBlue-600 hover:to-ncsBlue-700 btn-glass'
            )}
          >
            <Plus size={20} />
            Add Project
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i}>
              <div className="skeleton h-40 w-full"></div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any, index: number) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-ncsBlue-500/20">
                      <FolderKanban size={24} className="text-ncsBlue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.brandId?.name || 'No brand'}
                      </p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {project.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-emerald-500">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          project.progress >= 75 ? 'bg-gradient-to-r from-emerald-500 to-mantis-500' :
                          project.progress >= 50 ? 'bg-gradient-to-r from-lightSeaGreen-500 to-emerald-500' :
                          project.progress >= 25 ? 'bg-gradient-to-r from-coral-500 to-lightSeaGreen-500' :
                          'bg-gradient-to-r from-brightPink-500 to-coral-500'
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Tasks: {project.taskCount ?? 0}</span>
                  </div>
                  {project.createdBy && (
                    <div className="flex items-center gap-2 text-xs">
                      <span>Created by:</span>
                      <span className="font-medium">{project.createdBy?.name || 'Unknown'}</span>
                    </div>
                  )}
                </div>

                {project.startDate && project.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar size={16} />
                    <span>
                      {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project._id}`);
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                      'bg-ncsBlue-500/20 text-ncsBlue-500 hover:bg-ncsBlue-500/30 transition-colors'
                    )}
                  >
                    <TrendingUp size={16} />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project._id);
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      'bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors'
                    )}
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {projects?.length === 0 && (
        <GlassCard className="text-center py-12">
          <FolderKanban size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">No projects found. Create your first project!</p>
        </GlassCard>
      )}

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

