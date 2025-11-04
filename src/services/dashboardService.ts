import { api } from '@/utils/api';

export const dashboardService = {
  getStats: async (filters?: { company?: string; department?: string; employee?: string }) => {
    const qp = new URLSearchParams();
    if (filters?.company) qp.set('company', filters.company);
    if (filters?.department) qp.set('department', filters.department);
    if (filters?.employee) qp.set('employee', filters.employee);
    const path = qp.toString() ? `/dashboard/stats?${qp.toString()}` : '/dashboard/stats';
    const response = await api.get(path);
    return response;
  },

  getTaskTrends: async () => {
    const response = await api.get('/dashboard/task-trends');
    return response;
  },

  getProgressTrends: async () => {
    const response = await api.get('/dashboard/progress-trends');
    return response;
  },

  getTeamPerformance: async () => {
    const response = await api.get('/dashboard/team-performance');
    return response;
  },
  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response;
  },
};

