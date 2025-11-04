import { api } from '@/utils/api';
import type { Task, ApiResponse } from '@/types';

export const taskService = {
  getByProject: async (projectId: string) => {
    const response = await api.get<Task[]>(`/tasks/project/${projectId}`);
    return response;
  },

  getMyTasks: async () => {
    const response = await api.get<Task[]>('/tasks/my-tasks');
    return response;
  },

  getAssignedByMe: async () => {
    const response = await api.get<Task[]>('/tasks/assigned-by-me');
    return response;
  },

  getByStatus: async (status: string) => {
    const response = await api.get<Task[]>(`/tasks/status/${status}`);
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response;
  },

  create: async (data: {
    title: string;
    projectId: string;
    description?: string;
    assignedTo?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    isRecurring?: boolean;
    recurrence?: 'daily' | 'weekly' | 'monthly';
  }) => {
    const response = await api.post<Task>('/tasks', data);
    return response;
  },

  update: async (id: string, data: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
    return response;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put<Task>(`/tasks/${id}/status`, { status });
    return response;
  },

  assign: async (id: string, assignedTo: string) => {
    const response = await api.put<Task>(`/tasks/${id}/assign`, { assignedTo });
    return response;
  },

  addComment: async (id: string, text: string) => {
    const response = await api.post<Task>(`/tasks/${id}/comments`, { text });
    return response;
  },

  addLink: async (id: string, url: string, title?: string, description?: string) => {
    const response = await api.post<Task>(`/tasks/${id}/links`, { url, title, description });
    return response;
  },

  bulkUpdate: async (taskIds: string[], updates: Partial<Task>) => {
    const response = await api.post<ApiResponse<Task[]>>('/tasks/bulk-update', { taskIds, updates });
    return response;
  },

  sendTasksEmail: async (data: {
    to: string | string[];
    cc?: string | string[];
    subject?: string;
    regards?: string;
    department?: string;
    employeeId?: string;
    employeeIds?: string[];
    brandId?: string;
    projectId?: string;
  }) => {
    const response = await api.post<ApiResponse<{ tasksCount: number; accepted: string[]; rejected: string[] }>>(
      '/tasks/send-email',
      data
    );
    return response;
  },
};

