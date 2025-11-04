import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskService } from '@/services/taskService';
import { employeeService } from '@/services/employeeService';
import { GlassCard } from './GlassCard';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface TaskModalProps {
  projectId: string;
  task?: any;
  members?: Array<{ _id: string; name: string; email: string; role?: string }>;
  onClose: () => void;
}

export const TaskModal = ({ projectId, task, members = [], onClose }: TaskModalProps) => {
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [assignedTo, setAssignedTo] = useState<string>(task?.assignedTo?._id || task?.assignedTo || '');
  const [status, setStatus] = useState<string>(task?.status || 'yts');
  const [isRecurring, setIsRecurring] = useState<boolean>(task?.isRecurring || false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | ''>(task?.recurringType || '');
  const queryClient = useQueryClient();

  // Fetch employees based on user role
  const isSuperadmin = user?.role === 'superadmin';
  const { data: employeesResponse, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['task-modal-employees', user?.role, user?.company, user?.department],
    queryFn: async () => {
      try {
        const params: { company?: string; department?: string } = {};
        
        // For superadmin, fetch all employees (no filters)
        if (isSuperadmin) {
          const response = await employeeService.list();
          // Debug log
          if (import.meta.env.DEV) {
            console.log('TaskModal → Superadmin employees response:', response);
            console.log('TaskModal → Response:', response);
            console.log('TaskModal → Response.data:', (response as any)?.data);
            console.log('TaskModal → Response.data.data:', (response as any)?.data?.data);
          }
          // api.get() returns ApiResponse<T> which is { success: true, data: users }
          // So access response.data to get the users array (same pattern as Dashboard)
          const employees = ((response as any)?.data?.data || (response as any)?.data || []) as any[];
          return Array.isArray(employees) ? employees : [];
        }
        
        // For admin and user, filter by their company and department
        if (user?.company) params.company = user.company;
        if (user?.department) params.department = user.department;
        
        if (import.meta.env.DEV) {
          console.log('TaskModal → Fetching employees with params:', params);
          console.log('TaskModal → User:', { role: user?.role, company: user?.company, department: user?.department });
        }
        
        const response = await employeeService.list({ ...params, projectId });
        // Debug log
        if (import.meta.env.DEV) {
          console.log('TaskModal → Admin/User employees response:', response);
          console.log('TaskModal → Response:', response);
          console.log('TaskModal → Response.data:', (response as any)?.data);
          console.log('TaskModal → Response.data.data:', (response as any)?.data?.data);
        }
        // api.get() returns ApiResponse<T> which is { success: true, data: users }
        // So access response.data to get the users array (same pattern as Dashboard)
        const employees = ((response as any)?.data?.data || (response as any)?.data || []) as any[];
        return Array.isArray(employees) ? employees : [];
      } catch (error) {
        console.error('TaskModal → Error fetching employees:', error);
        return [];
      }
    },
    enabled: true, // Always enabled - fetch employees when modal opens
  });

  // Debug log
  if (import.meta.env.DEV) {
    console.log('TaskModal → employeesResponse:', employeesResponse);
    console.log('TaskModal → employeesLoading:', employeesLoading);
    console.log('TaskModal → employeesError:', employeesError);
    console.log('TaskModal → isSuperadmin:', isSuperadmin);
    console.log('TaskModal → user:', user);
  }

  // Use fetched employees if available, otherwise fall back to members prop
  const availableEmployees = (Array.isArray(employeesResponse) ? employeesResponse : members) as Array<{ _id: string; name: string; email: string; role?: string }>;
  
  if (import.meta.env.DEV) {
    console.log('TaskModal → availableEmployees:', availableEmployees);
    console.log('TaskModal → availableEmployees length:', availableEmployees?.length);
  }

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (task) {
        return taskService.update(task._id, data);
      }
      return taskService.create({ ...data, projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save task';
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { title, description, priority, dueDate, status };
    if (assignedTo) payload.assignedTo = assignedTo;
    payload.isRecurring = isRecurring;
    payload.recurringType = isRecurring ? (recurringType || 'daily') : null;
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
                {task ? 'Edit Task' : 'Create Task'}
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
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                  placeholder="Enter task title"
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
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className={cn(
                      'w-full px-4 py-3 rounded-lg border transition-colors',
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                    )}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-lg border transition-colors',
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-lg border transition-colors',
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                    )}
                  >
                    <option value="yts">YTS</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="recurring">Recurring</option>
                    <option value="ad-hoc">Ad-hoc</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="under-review">Under Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assign To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={employeesLoading}
                    className={cn(
                      'w-full px-4 py-3 rounded-lg border transition-colors',
                      isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50',
                      employeesLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <option value="">{employeesLoading ? 'Loading employees...' : 'Unassigned'}</option>
                    {Array.isArray(availableEmployees) && availableEmployees.length > 0 ? (
                      availableEmployees.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email}) {m.role === 'external' ? '(external)' : ''}</option>
                      ))
                    ) : (
                      !employeesLoading && <option value="" disabled>No employees available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-3 mt-2">
                  <input id="recur" type="checkbox" checked={isRecurring} onChange={(e)=>setIsRecurring(e.target.checked)} />
                  <label htmlFor="recur" className="text-sm">Recurring</label>
                </div>
                {isRecurring && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Recurring Type</label>
                    <select
                      value={recurringType}
                      onChange={(e)=>setRecurringType(e.target.value as any)}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg border transition-colors',
                        isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
                        'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                      )}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
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
                  {mutation.isPending ? 'Saving...' : task ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

