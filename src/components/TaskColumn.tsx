import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { GlassCard } from './GlassCard';
import { cn } from '@/utils/cn';
import type { Task } from '@/types';

interface TaskColumnProps {
  status: { id: string; label: string; color: string };
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  projectId?: string;
}

export const TaskColumn = ({ status, tasks, onEditTask, projectId }: TaskColumnProps) => {
  const taskIds = tasks.map((task) => task._id);
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  const headerTint: Record<string, string> = {
    'yts': 'bg-coral-500/10',
    'in-progress': 'bg-ncsBlue-500/10',
    'on-hold': 'bg-coral-500/10',
    'completed': 'bg-mantis-500/10',
    'recurring': 'bg-emerald-500/10',
    'ad-hoc': 'bg-lightSeaGreen-500/10',
    'under-review': 'bg-midnightGreen-500/10',
    'cancelled': 'bg-brightPink-500/10',
  };

  return (
    <div className="flex flex-col h-full">
      <GlassCard variant="solid" className={cn('mb-4', 'border rounded-2xl p-6', headerTint[status.id] || '')}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{status.label}</h3>
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            `bg-${status.color}-500/20 text-${status.color}-500`
          )}>
            {tasks.length}
          </span>
        </div>
      </GlassCard>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 space-y-3 min-h-[200px] p-1 rounded-lg transition-colors',
            isOver ? `bg-${status.color}-500/10` : 'bg-transparent'
          )}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={onEditTask} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

