import { motion } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { InviteModal } from '@/components/InviteModal';
import { useThemeStore } from '@/store/themeStore';

export const TeamManagement = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { isDark } = useThemeStore();
  const canInvite = user?.role === 'admin' || user?.role === 'superadmin';

  // Fetch users filtered by company and department (same logic as brands/projects)
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['team-employees', user?.role, user?.company, user?.department],
    queryFn: async () => {
      const params: { company?: string; department?: string } = {};
      // For superadmin, don't pass any filters (backend will return all)
      // For admin/user, filter by their company and department
      if (user?.role !== 'superadmin') {
        if (user?.company) params.company = user.company;
        if (user?.department) params.department = user.department;
      }
      const response = await employeeService.list(params);
      // Debug log
      if (import.meta.env.DEV) {
        console.log('TeamManagement → Fetching employees with params:', params);
        console.log('TeamManagement → User role:', user?.role);
        console.log('TeamManagement → Response:', response);
        console.log('TeamManagement → Response.data:', (response as any)?.data);
      }
      // api.get() returns ApiResponse<T> which is { success: true, data: users }
      // So response.data is the users array
      const employees = ((response as any)?.data?.data || (response as any)?.data || []) as any[];
      if (import.meta.env.DEV) {
        console.log('TeamManagement → Employees found:', Array.isArray(employees) ? employees.length : 0);
        console.log('TeamManagement → Employees array:', employees);
      }
      return Array.isArray(employees) ? employees : [];
    },
    enabled: !!user,
  });

  const employees = employeesResponse || [];

  const handleInvite = async (email: string, targetType: 'brand' | 'project', targetId: string) => {
    try {
      setIsInviting(true);
      const response = await authService.invite({ email, targetType, targetId });
      const responseData = (response as any)?.data;
      
      if (responseData?.granted) {
        alert(`Access granted to ${email} successfully!`);
      } else if (responseData?.emailSent) {
        alert('Invitation sent successfully!');
      } else if (responseData?.inviteUrl) {
        // Email sending failed, show the invite URL
        const shouldCopy = confirm(
          `Invitation created but email sending failed.\n\nInvite URL: ${responseData.inviteUrl}\n\nWould you like to copy this link to clipboard?`
        );
        if (shouldCopy) {
          navigator.clipboard.writeText(responseData.inviteUrl);
          alert('Invite link copied to clipboard!');
        }
      } else {
        alert((response as any)?.message || 'Invitation sent successfully!');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      console.error('Invite error:', e);
      alert(e?.response?.data?.message || e?.message || 'Failed to send invite');
      throw e;
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your team members</p>
        </motion.div>
        {canInvite && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all',
              'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
              'hover:from-ncsBlue-600 hover:to-ncsBlue-700 btn-glass'
            )}
          >
            <UserPlus size={20} />
            Invite Member
          </button>
        )}
      </div>

      {isLoading ? (
        <GlassCard>
          <div className="skeleton h-96 w-full"></div>
        </GlassCard>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp: any, index: number) => (
            <motion.div
              key={emp._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-ncsBlue-500/20">
                      <Users size={24} className="text-ncsBlue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{emp.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{emp.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {emp.role && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Role:</span>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs',
                        emp.role === 'superadmin' ? 'bg-brightPink-500/20 text-brightPink-500' :
                        emp.role === 'admin' ? 'bg-ncsBlue-500/20 text-ncsBlue-500' :
                        emp.role === 'external' ? 'bg-coral-500/20 text-coral-500' :
                        'bg-mantis-500/20 text-mantis-500'
                      )}>
                        {emp.role === 'external' ? 'External' : emp.role}
                      </span>
                      {emp.hasPendingInvitation && (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs',
                          'bg-yellow-500/20 text-yellow-500 animate-pulse'
                        )}>
                          Pending Invitation
                        </span>
                      )}
                    </div>
                  )}
                  {emp.employeeId && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Employee ID:</span>
                      <span className="font-medium">{emp.employeeId}</span>
                    </div>
                  )}
                  {emp.company && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Company:</span>
                      <span className="font-medium">{emp.company}</span>
                    </div>
                  )}
                  {emp.department && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Department:</span>
                      <span className="font-medium">{emp.department}</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <GlassCard>
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No team members found</p>
          </div>
        </GlassCard>
      )}

      {isModalOpen && (
        <InviteModal
          onClose={() => setIsModalOpen(false)}
          onInvite={handleInvite}
          isInviting={isInviting}
        />
      )}
    </div>
  );
};

