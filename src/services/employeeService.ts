import { api } from '@/utils/api';

export const employeeService = {
  list: (params?: { role?: string; company?: string; department?: string; q?: string; projectId?: string; brandId?: string }) =>
    api.get('/auth/employees', { params }),
};


