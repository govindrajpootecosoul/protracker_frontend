import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { TaskColumn } from './TaskColumn';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types';

const statuses = [
  { id: 'yts', label: 'To Do', color: 'coral' },
  { id: 'in-progress', label: 'In Progress', color: 'ncsBlue' },
  { id: 'on-hold', label: 'On Hold', color: 'coral' },
  { id: 'completed', label: 'Completed', color: 'mantis' },
  { id: 'recurring', label: 'Recurring', color: 'emerald' },
  { id: 'ad-hoc', label: 'Ad-hoc', color: 'lightSeaGreen' },
  { id: 'under-review', label: 'Under Review', color: 'midnightGreen' },
  { id: 'cancelled', label: 'Cancelled', color: 'brightPink' },
];

const mainStatuses = ['yts', 'in-progress', 'on-hold', 'completed'];

interface KanbanBoardProps {
  tasks: Task[];
  projectId?: string;
  onEditTask?: (task: Task) => void;
  filterStatus?: string;
}

export const KanbanBoard = ({ tasks, projectId, onEditTask, filterStatus }: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => {
      console.log('KanbanBoard → Updating status:', { taskId, status });
      return taskService.updateStatus(taskId, status);
    },
    onMutate: async ({ taskId, status }) => {
      console.log('KanbanBoard → onMutate called:', { taskId, status });
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-tasks'] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['my-tasks']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['my-tasks'], (old: any) => {
        if (!old) return old;
        const updated = old.map((t: any) => 
          t._id === taskId ? { ...t, status } : t
        );
        console.log('KanbanBoard → Optimistic update:', { oldLength: old.length, updatedLength: updated.length });
        return updated;
      });
      
      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onSuccess: (data) => {
      console.log('KanbanBoard → Status update successful:', data);
      // Immediately invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      }
    },
    onError: (err: any, variables, context) => {
      console.error('KanbanBoard → Status update failed:', err, err?.response?.data);
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
      // If the mutation fails, roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['my-tasks'], context.previousTasks);
      }
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    let dropId = over.id as string;

    // If dropped over another task card, resolve its column by that task's status
    let newStatus = dropId;
    const droppedOverTask = tasks.find((t) => t._id === dropId);
    if (droppedOverTask) {
      newStatus = droppedOverTask.status;
    } else {
      // Ensure dropId is one of the known column ids; otherwise ignore
      const isColumnId = statuses.some((s) => s.id === dropId);
      if (!isColumnId) return;
    }

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      updateStatusMutation.mutate({ taskId, status: newStatus });
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(filterStatus && filterStatus !== 'all'
          ? statuses.filter((s)=> s.id === filterStatus)
          : statuses.filter((s)=> mainStatuses.includes(s.id))
        ).map((status) => {
          const statusTasks = getTasksByStatus(status.id);
          return (
            <TaskColumn key={status.id} status={status} tasks={statusTasks} onEditTask={onEditTask} projectId={projectId} />
          );
        })}
      </div>

      <DragOverlay>
        {activeId ? (
          <TaskCard task={tasks.find((t) => t._id === activeId)!} onEdit={onEditTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

