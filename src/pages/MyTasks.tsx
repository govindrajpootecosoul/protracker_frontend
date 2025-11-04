import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Filter, CheckSquare, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { taskService } from '@/services/taskService';
import { KanbanBoard } from '@/components/KanbanBoard';
import { GlassCard } from '@/components/GlassCard';
import { TaskModal } from '@/components/TaskModal';
import { EmailModal } from '@/components/EmailModal';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export const MyTasks = () => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const shouldUseSeparatePage = isSuperadmin || isAdmin;

  // Fetch all tasks once and filter on client side to prevent query key changes
  const { data: allTasks, isLoading, isFetching } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await taskService.getMyTasks();
      return response.data || [];
    },
    staleTime: 5000, // Consider data fresh for 5 seconds
    gcTime: 30000, // Keep data in cache for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Filter tasks client-side based on statusFilter
  const tasks = allTasks?.filter((task: any) => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  }) || [];

  // Get in-progress tasks count for email button
  const inProgressTasksCount = allTasks?.filter((task: any) => task.status === 'in-progress').length || 0;

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: taskService.sendTasksEmail,
    onSuccess: (data) => {
      setIsEmailModalOpen(false);
      const message = data?.data?.message || 'Email sent successfully!';
      alert(message);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send email. Please check email configuration.';
      alert(errorMessage);
      console.error('Email send error:', error);
    },
  });

  // Only show skeleton on initial load, not on refetch
  if (isLoading && !allTasks) {
    return (
      <div className="p-6">
        <div className="skeleton h-96 w-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your assigned tasks</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (shouldUseSeparatePage) {
                navigate('/send-tasks-email');
              } else {
                setIsEmailModalOpen(true);
              }
            }}
            disabled={inProgressTasksCount === 0}
            className={cn(
              'px-4 py-2 rounded-lg bg-ncsBlue-500 text-white hover:bg-ncsBlue-600',
              'transition-colors flex items-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Mail size={18} />
            Send Mail {inProgressTasksCount > 0 && `(${inProgressTasksCount})`}
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-colors',
              isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300',
              'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
            )}
          >
            <option value="all">All Status</option>
            <option value="yts">YTS</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="recurring">Recurring</option>
            <option value="ad-hoc">Ad-hoc</option>
            <option value="cancelled">Cancelled</option>
            <option value="under-review">Under Review</option>
          </select>
          <button
            onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-ncsBlue-500/20 hover:border-ncsBlue-500/50',
              'border border-transparent'
            )}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {tasks && tasks.length > 0 ? (
        view === 'kanban' ? (
          <div className={isFetching ? 'opacity-90 transition-opacity' : ''}>
            <KanbanBoard
              tasks={tasks}
              filterStatus={statusFilter}
              onEditTask={(t)=>{ setSelectedTask(t); setIsTaskModalOpen(true); }}
            />
          </div>
        ) : (
          <div className={`space-y-3 ${isFetching ? 'opacity-90 transition-opacity' : ''}`}>
            {tasks.map((task: any) => (
              <GlassCard key={task._id} className="hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{task.status?.replace('-', ' ')}</span>
                        <span className="capitalize">{task.priority} priority</span>
                        {task.project?.name && <span>Project: {task.project.name}</span>}
                      </div>
                      {task.createdBy && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <span>Created by:</span>
                          <span className="font-medium">{task.createdBy?.name || 'Unknown'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <button
                      type="button"
                      onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                      className="px-3 py-2 rounded bg-ncsBlue-500/20 text-ncsBlue-700 hover:bg-ncsBlue-500/30"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      ) : (
        <GlassCard className="text-center py-12">
          <CheckSquare size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">No tasks found.</p>
        </GlassCard>
      )}

      {isTaskModalOpen && (
        <TaskModal
          projectId={(selectedTask?.projectId?._id || selectedTask?.projectId || '') as string}
          task={selectedTask || undefined}
          onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
        />
      )}

      {isEmailModalOpen && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onSend={async (data) => {
            await sendEmailMutation.mutateAsync(data);
          }}
          isLoading={sendEmailMutation.isPending}
        />
      )}
    </div>
  );
};

