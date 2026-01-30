import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User, LoginRequest, RegisterRequest } from '../types/api.types';
import { toast } from 'sonner';
import { setAuthToken } from '../services/api';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setTokens: (accessToken, refreshToken) => {
    setAuthToken(accessToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      setAuthToken(response.accessToken);
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('התחברת בהצלחה!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בהתחברות';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      setAuthToken(response.accessToken);
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('נרשמת בהצלחה!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בהרשמה';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      toast.success('התנתקת בהצלחה');
    }
  },

  getCurrentUser: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false });
    } catch (error: any) {
      console.error('Get current user error:', error);
      set({ isLoading: false });
      // If 401, clear auth
      if (error.response?.status === 401) {
        get().clearAuth();
      }
    }
  },

  clearAuth: () => {
    setAuthToken(null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
