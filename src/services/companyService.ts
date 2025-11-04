import { api } from '@/utils/api';

export const companyService = {
  list: () => api.get('/companies'),
  create: (payload: { name: string; description?: string }) => api.post('/companies', payload),
};


