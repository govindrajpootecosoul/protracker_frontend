import { api } from '@/utils/api';

export const departmentService = {
  list: (company?: string) => api.get('/departments', { params: { company } }),
  create: (payload: { name: string; company: string; description?: string }) => api.post('/departments', payload),
};


