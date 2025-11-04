import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load from localStorage on init
  const loadAuth = () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  };

  return {
    ...loadAuth(),
    setAuth: (user, accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
      });
    },
    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false,
      });
    },
    updateUser: (updatedUser) =>
      set((state) => {
        const newUser = state.user ? { ...state.user, ...updatedUser } : null;
        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        return { user: newUser };
      }),
    initAuth: () => {
      const auth = loadAuth();
      set(auth);
    },
  };
});

