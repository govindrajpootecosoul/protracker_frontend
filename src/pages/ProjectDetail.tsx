import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { authService } from '@/services/authService';
import { employeeService } from '@/services/employeeService';
import { KanbanBoard } from '@/components/KanbanBoard';
import { GlassCard } from '@/components/GlassCard';
import { TaskModal } from '@/components/TaskModal';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInviting, setIsInviting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const canInvite = user?.role === 'admin' || user?.role === 'superadmin';

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectService.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: async () => {
      const response = await taskService.getByProject(id!);
      const taskList = response.data || [];
      // Debug: Log first task to see structure
      if (taskList.length > 0) {
        console.log('ProjectDetail - First task:', taskList[0]);
        console.log('ProjectDetail - First task assignedTo:', taskList[0]?.assignedTo, 'Type:', typeof taskList[0]?.assignedTo);
      }
      return taskList;
    },
    enabled: !!id,
  });

  // Fetch employees filtered by brand's company and department
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', project?.company, project?.department, id],
    queryFn: async () => {
      if (!project?.company || !project?.department) return [];
      const response = await employeeService.list({
        company: project.company,
        department: project.department,
        projectId: id,
      });
      return (response as any)?.data?.data || (response as any)?.data || [];
    },
    enabled: !!project?.company && !!project?.department && !!id,
  });

  const availableEmployees = employeesResponse || [];

  if (projectLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-96 w-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className={cn(
              'p-2 rounded-lg hover:bg-ncsBlue-500/20 transition-colors'
            )}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
              {project?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{project?.description}</p>
            {project?.createdBy && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Created by: <span className="font-medium">{(typeof project.createdBy === 'object' && project.createdBy ? project.createdBy.name : 'Unknown') || 'Unknown'}</span>
              </p>
            )}
          </div>
        </div>
            <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e)=> setStatusFilter(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-colors',
              'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700',
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
          {canInvite && (
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const email = prompt('Enter external user email to invite');
                if (!email || !email.trim()) {
                  return;
                }
                if (!id) {
                  alert('Project ID not found');
                  return;
                }
                try {
                  setIsInviting(true);
                  const resp = await authService.invite({ email: email.trim(), targetType: 'project', targetId: id });
                  console.log('Invite response:', resp);
                  alert('Invitation sent successfully!');
                } catch (e: any) {
                  console.error('Invite error:', e);
                  alert(e?.response?.data?.message || e?.message || 'Failed to send invite');
                } finally {
                  setIsInviting(false);
                }
              }}
              disabled={isInviting || !id}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all',
                'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
                'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed btn-glass'
              )}
            >
              <UserPlus size={18} /> {isInviting ? 'Sending...' : 'Invite'}
            </button>
          )}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all',
              'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white',
              'hover:from-ncsBlue-600 hover:to-ncsBlue-700 btn-glass'
            )}
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      {project?.progress !== undefined && (
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Project Progress</span>
            <span className={cn(
              'text-sm font-semibold',
              project.progress >= 75 ? 'text-mantis-500' :
              project.progress >= 50 ? 'text-emerald-500' :
              project.progress >= 25 ? 'text-coral-500' :
              'text-brightPink-500'
            )}>{project.progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
        </GlassCard>
      )}

      {tasksLoading ? (
        <div className="skeleton h-96 w-full"></div>
      ) : tasks && tasks.length > 0 ? (
        <KanbanBoard
          tasks={tasks}
          projectId={id}
          filterStatus={statusFilter}
          onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }}
        />
      ) : (
        <GlassCard className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No tasks found. Create your first task!</p>
        </GlassCard>
      )}

      {isTaskModalOpen && (
        <TaskModal
          projectId={id!}
          task={selectedTask || undefined}
          members={availableEmployees}
          onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
        />
      )}
    </div>
  );
};

