import { api } from '@/utils/api';
import type { Brand, ApiResponse } from '@/types';

export const brandService = {
  getAll: async () => {
    const response = await api.get<Brand[]>('/brands');
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get<Brand>(`/brands/${id}`);
    return response;
  },

  create: async (data: { name: string; description?: string; company?: string; department?: string }) => {
    const response = await api.post<Brand>('/brands', data);
    return response;
  },

  update: async (id: string, data: { name?: string; description?: string; status?: string }) => {
    const response = await api.put<Brand>(`/brands/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/brands/${id}`);
    return response;
  },

  getMembers: async (id: string) => {
    const response = await api.get<Brand>(`/brands/${id}/members`);
    return response;
  },

  addMember: async (id: string, userId: string) => {
    const response = await api.post<Brand>(`/brands/${id}/members`, { userId });
    return response;
  },

  removeMember: async (id: string, userId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/brands/${id}/members/${userId}`);
    return response;
  },
};

