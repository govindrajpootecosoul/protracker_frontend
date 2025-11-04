import { api } from '@/utils/api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response;
  },

  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response;
  },

  refreshToken: async (token: string) => {
    const response = await api.post<AuthResponse>('/auth/refresh-token', { token });
    return response;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  resetPassword: async (email: string, token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { email, token, password });
    return response;
  },

  invite: async (payload: { email: string; targetType: 'brand' | 'project'; targetId: string }) => {
    const response = await api.post('/auth/invite', payload);
    return response;
  },

  acceptInvitation: async (payload: { token: string; email: string; name?: string; password?: string; type?: 'brand' | 'project'; id?: string }) => {
    const response = await api.post('/auth/accept-invitation', payload);
    return response;
  },

  // In-app invitation endpoints
  getInvitation: async () => {
    const response = await api.get('/auth/invitation');
    return response;
  },
  acceptInvitationAuth: async (payload?: { type?: 'brand' | 'project'; id?: string }) => {
    const response = await api.post('/auth/invitation/accept', payload || {});
    return response;
  },
  dismissInvitation: async () => {
    const response = await api.post('/auth/invitation/dismiss');
    return response;
  },
};

