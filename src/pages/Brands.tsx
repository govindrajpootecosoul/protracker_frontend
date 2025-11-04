import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Building2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { brandService } from '@/services/brandService';
import { authService } from '@/services/authService';
import { GlassCard } from '@/components/GlassCard';
import { cn } from '@/utils/cn';
import { BrandModal } from '@/components/BrandModal';
import { InviteModal } from '@/components/InviteModal';
import { useAuthStore } from '@/store/authStore';

export const Brands = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canCreateBrand = user?.role === 'admin' || user?.role === 'superadmin';

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandService.getAll();
      return response.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      // Also invalidate projects since they might have been deleted too
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      console.error('Delete brand error:', error);
      alert(error?.response?.data?.message || 'Failed to delete brand. Please try again.');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, brandIds, projectIds }: { email: string; brandIds: string[]; projectIds: string[] }) => {
      const promises: Promise<any>[] = [];
      
      // Invite to brands
      for (const brandId of brandIds) {
        promises.push(
          authService.invite({ email, targetType: 'brand', targetId: brandId })
        );
      }
      
      // If projectIds is empty array, it means "All Projects" - don't send project invites
      // If projectIds has items, invite to those specific projects
      if (projectIds.length > 0) {
        for (const projectId of projectIds) {
          promises.push(
            authService.invite({ email, targetType: 'project', targetId: projectId })
          );
        }
      }
      
      const results = await Promise.all(promises);
      return results;
    },
    onSuccess: () => {
      setIsInviteModalOpen(false);
      alert('Invitations sent successfully!');
    },
    onError: (error: any) => {
      console.error('Invite error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send invitations. Please try again.';
      alert(errorMessage);
    },
  });

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const brand = brands?.find((b: any) => b._id === id);
    const projectCount = (brand as any)?.projectCount || 0;
    
    const confirmMessage = projectCount > 0
      ? `Are you sure you want to delete this brand?\n\nThis will permanently delete:\n- The brand\n- ${projectCount} project(s) associated with this brand\n- All tasks under those projects\n\nThis action cannot be undone!`
      : 'Are you sure you want to delete this brand? This action cannot be undone!';
    
    if (confirm(confirmMessage)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Error handled by onError callback
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i}>
              <div className="skeleton h-32 w-full"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
            Brands & Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your brands and companies</p>
        </motion.div>
        <div className="flex items-center gap-3">
          {canCreateBrand && (
            <>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all',
                  'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
                  'hover:from-emerald-600 hover:to-emerald-700 btn-glass'
                )}
              >
                <UserPlus size={20} />
                Invite
              </button>
              <button
                onClick={handleAdd}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all',
                  'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
                  'hover:from-ncsBlue-600 hover:to-ncsBlue-700 btn-glass'
                )}
              >
                <Plus size={20} />
                Add Brand
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands?.map((brand: any, index: number) => {
          // Check if this brand is accessible via invitation (external brand)
          const isExternalBrand = user?.accessibleBrands?.some((bid: string) => bid === brand._id || bid.toString() === brand._id.toString());
          
          return (
          <motion.div
            key={brand._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard
              className={cn(
                'cursor-pointer hover:scale-105 transition-transform',
                brand.status === 'active' && 'border-emerald-500/50',
                isExternalBrand && 'border-coral-500/50'
              )}
              onClick={() => navigate(`/projects?brandId=${brand._id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-brightPink-500/20">
                    <Building2 size={24} className="text-brightPink-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {brand.status && (
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            brand.status === 'active'
                              ? 'bg-mantis-500/20 text-mantis-400'
                              : 'bg-gray-500/20 text-gray-400'
                          )}
                        >
                          {brand.status}
                        </span>
                      )}
                      {isExternalBrand && (
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            'bg-coral-500/20 text-coral-500 border border-coral-500/30'
                          )}
                        >
                          External Brand
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {brand.description}
                </p>
              )}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center justify-between">
                  <span>Projects: {brand.projectCount ?? 0}</span>
                </div>
                {brand.createdBy && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Created by:</span>
                    <span className="font-medium">{brand.createdBy?.name || 'Unknown'}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(brand); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                    'bg-coral-500/20 text-coral-500 hover:bg-coral-500/30 transition-colors'
                  )}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(brand._id); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                    'bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors'
                  )}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </GlassCard>
          </motion.div>
          );
        })}
      </div>

      {brands?.length === 0 && (
        <GlassCard className="text-center py-12">
          <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">No brands found. Create your first brand!</p>
        </GlassCard>
      )}

      {isModalOpen && (
        <BrandModal
          brand={editingBrand}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBrand(null);
          }}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={async (email, brandIds, projectIds) => {
            await inviteMutation.mutateAsync({ email, brandIds, projectIds });
          }}
          isInviting={inviteMutation.isPending}
        />
      )}
    </div>
  );
};

