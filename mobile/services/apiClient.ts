import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT } from '@/constants/config';

// ─── Axios Client Setup ───────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore unavailable (web dev mode)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };

// ─── Error handler ────────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    return data?.detail || data?.error || data?.message || error.message || 'Network error';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
  }
  return false;
}
