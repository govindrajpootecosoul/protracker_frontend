import { api } from '@/utils/api';
import type { Brand, Project, Task } from '@/types';

export const searchService = {
  searchAll: async (query: string) => {
    const response = await api.get<{ brands: Brand[]; projects: Project[]; tasks: Task[] }>(`/search?q=${query}`);
    return response;
  },

  searchBrands: async (query: string) => {
    const response = await api.get<Brand[]>(`/search/brands?q=${query}`);
    return response;
  },

  searchProjects: async (query: string) => {
    const response = await api.get<Project[]>(`/search/projects?q=${query}`);
    return response;
  },

  searchTasks: async (query: string) => {
    const response = await api.get<Task[]>(`/search/tasks?q=${query}`);
    return response;
  },
};

