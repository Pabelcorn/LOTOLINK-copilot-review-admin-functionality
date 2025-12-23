/**
 * Authentication Service
 * Handles user authentication and session management
 */

import apiClient from './api';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from '../constants';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  wallet_balance?: number;
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  
  // Store tokens
  await Preferences.set({
    key: STORAGE_KEYS.JWT_TOKEN,
    value: response.data.access_token,
  });
  
  await Preferences.set({
    key: STORAGE_KEYS.USER_ID,
    value: response.data.user.id,
  });
  
  return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  
  // Store tokens
  await Preferences.set({
    key: STORAGE_KEYS.JWT_TOKEN,
    value: response.data.access_token,
  });
  
  await Preferences.set({
    key: STORAGE_KEYS.USER_ID,
    value: response.data.user.id,
  });
  
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    await Preferences.remove({ key: STORAGE_KEYS.JWT_TOKEN });
    await Preferences.remove({ key: STORAGE_KEYS.USER_ID });
    await Preferences.remove({ key: STORAGE_KEYS.BIOMETRIC_ENABLED });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<string> => {
  const response = await apiClient.post<{ access_token: string }>('/auth/refresh');
  
  await Preferences.set({
    key: STORAGE_KEYS.JWT_TOKEN,
    value: response.data.access_token,
  });
  
  return response.data.access_token;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { value: token } = await Preferences.get({ key: STORAGE_KEYS.JWT_TOKEN });
  return !!token;
};

/**
 * Get stored JWT token
 */
export const getToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: STORAGE_KEYS.JWT_TOKEN });
  return value;
};
