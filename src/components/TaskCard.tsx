import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User as UserIcon, Flag } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  projectId?: string;
}

export const TaskCard = ({ task, onEdit, projectId }: TaskCardProps) => {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-mantis-500/20 text-mantis-500',
    medium: 'bg-coral-500/20 text-coral-500',
    high: 'bg-brightPink-500/20 text-brightPink-500',
  };

  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => {
      console.log('TaskCard → Updating status:', { taskId: task._id, status });
      return taskService.updateStatus(task._id, status);
    },
    onMutate: async (newStatus) => {
      console.log('TaskCard → onMutate called:', newStatus);
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['my-tasks'] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['my-tasks']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['my-tasks'], (old: any) => {
        if (!old) return old;
        const updated = old.map((t: any) => 
          t._id === task._id ? { ...t, status: newStatus.status } : t
        );
        console.log('TaskCard → Optimistic update:', { oldLength: old.length, updatedLength: updated.length });
        return updated;
      });
      
      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onSuccess: (data) => {
      console.log('TaskCard → Status update successful:', data);
      // Immediately invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
    },
    onError: (err: any, _newStatus, context) => {
      console.error('TaskCard → Status update failed:', err, err?.response?.data);
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['my-tasks'], context.previousTasks);
      }
    },
  });

  const statusBorder = {
    'completed': 'border-l-4 border-mantis-500',
    'cancelled': 'border-l-4 border-brightPink-500',
    'in-progress': 'border-l-4 border-ncsBlue-500',
    'on-hold': 'border-l-4 border-coral-500',
    'yts': 'border-l-4 border-coral-500',
    'recurring': 'border-l-4 border-emerald-500',
    'ad-hoc': 'border-l-4 border-lightSeaGreen-500',
    'under-review': 'border-l-4 border-midnightGreen-500',
  } as Record<string, string>;

  const statusTint = {
    'completed': 'bg-mantis-500/10',
    'cancelled': 'bg-brightPink-500/10',
    'in-progress': 'bg-ncsBlue-500/10',
    'on-hold': 'bg-coral-500/10',
    'yts': 'bg-coral-500/10',
    'recurring': 'bg-emerald-500/10',
    'ad-hoc': 'bg-lightSeaGreen-500/10',
    'under-review': 'bg-midnightGreen-500/10',
  } as Record<string, string>;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GlassCard className={cn(
        'cursor-move hover:scale-105 transition-transform',
        statusBorder[task.status] || '',
        statusTint[task.status] || ''
      )}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm flex-1">{task.title}</h4>
          <Flag
            size={16}
            className={cn(
              priorityColors[task.priority] || priorityColors.medium
            )}
          />
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={12} />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onEdit(task); 
                }}
                onMouseDown={(e) => { 
                  e.stopPropagation(); 
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                className="ml-auto px-2 py-1 rounded bg-ncsBlue-500/20 text-ncsBlue-600 hover:bg-ncsBlue-500/30 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Edit
              </button>
            )}
          </div>
          {(() => {
            // Get assigned user name - backend populates assignedTo as User object
            let assignedName: string | null = null;
            
            // Check assignedUser first (if exists)
            if (task.assignedUser?.name) {
              assignedName = task.assignedUser.name;
            } 
            // Check if assignedTo is an object with name property (populated from backend)
            else if (task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo !== null) {
              // Try to get name property
              const assignedToAny = task.assignedTo as any;
              if (assignedToAny.name) {
                assignedName = assignedToAny.name;
              } else if (assignedToAny._id) {
                // If it has _id but no name, it might be partially populated - log for debugging
                console.warn('TaskCard: assignedTo has _id but no name:', task._id, assignedToAny);
              }
            } else if (task.assignedTo && typeof task.assignedTo === 'string') {
              // If it's just a string ID, we can't show name (not populated)
              console.warn('TaskCard: assignedTo is string ID, not populated:', task._id, task.assignedTo);
            }
            
            return assignedName ? (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                <UserIcon size={12} />
                <span>Assign to:</span>
                <span className="font-medium">{assignedName}</span>
              </div>
            ) : null;
          })()}
          {(typeof task.createdBy === 'object' && task.createdBy?.name) && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
              <span>Created by:</span>
              <span className="font-medium">{task.createdBy?.name || 'Unknown'}</span>
            </div>
          )}
        </div>

        {/* Quick status dropdown */}
        <div className="mt-2 relative z-50">
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              updateStatusMutation.mutate({ status: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 text-xs rounded border border-ncsBlue-500/30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50"
            style={{ pointerEvents: 'auto' }}
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
      </GlassCard>
    </div>
  );
};

