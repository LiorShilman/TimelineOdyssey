import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token storage - will be set by auth store
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Refresh token logic — uses raw axios to avoid interceptor recursion
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const stored = localStorage.getItem('refreshToken');
  if (!stored) return null;

  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: stored });
    const newAccessToken = res.data?.data?.accessToken;
    if (newAccessToken) {
      setAuthToken(newAccessToken);
      return newAccessToken;
    }
  } catch {
    localStorage.removeItem('refreshToken');
  }
  return null;
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — attempts token refresh on 401 before redirecting
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalConfig?._retry) {
          originalConfig._retry = true;

          // Only one refresh at a time; other 401s wait for the same promise
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = tryRefresh();
          }

          const newToken = await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;

          if (newToken && originalConfig) {
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            return this.instance.request(originalConfig);
          }

          // Refresh failed — redirect to login
          const base = import.meta.env.BASE_URL;
          if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
            window.location.href = base + 'login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config = {}) {
    return this.instance.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config = {}) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config = {}) {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.instance.delete<T>(url, config);
  }

  public patch<T>(url: string, data?: any, config = {}) {
    return this.instance.patch<T>(url, data, config);
  }
}

export const api = new ApiService();
