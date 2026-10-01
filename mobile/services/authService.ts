import * as SecureStore from 'expo-secure-store';
import { apiClient } from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username?: string;
  email?: string;
  user_id?: string;
}

export interface UserData {
  username: string;
  email?: string;
  user_id?: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
  // Login with username + password
  login: async (username: string, password: string): Promise<AuthResponse> => {
    // FastAPI OAuth2 form format
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post<AuthResponse>('/api/auth/token', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    await SecureStore.setItemAsync(TOKEN_KEY, response.data.access_token);
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify({
        username: response.data.username || username,
        email: response.data.email,
        user_id: response.data.user_id,
      })
    );

    return response.data;
  },

  // Register new account
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  // Logout — clear local session
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Get stored user data
  getUser: async (): Promise<UserData | null> => {
    try {
      const raw = await SecureStore.getItemAsync(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Check if currently authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    return !!token;
  },

  // Guest mode — uses API without authentication
  enterGuestMode: async (): Promise<void> => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify({ username: 'Guest', email: '' }));
  },
};
