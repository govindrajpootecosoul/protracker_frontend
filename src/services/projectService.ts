import { api } from '@/utils/api';
import type { Project, ApiResponse } from '@/types';

export const projectService = {
  getByBrand: async (brandId: string) => {
    const response = await api.get<Project[]>(`/projects/brand/${brandId}`);
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response;
  },

  create: async (data: { name: string; brandId: string; description?: string }) => {
    const response = await api.post<Project>('/projects', data);
    return response;
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/projects/${id}`);
    return response;
  },

  getStats: async (id: string) => {
    const response = await api.get(`/projects/${id}/stats`);
    return response;
  },

  updateProgress: async (id: string, progress: number) => {
    const response = await api.put<Project>(`/projects/${id}/progress`, { progress });
    return response;
  },
};

