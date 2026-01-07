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

/**
 * Send OTP to phone
 */
export const sendOtp = async (phone: string, purpose: string): Promise<{ success: boolean; expiresIn: number }> => {
  const response = await apiClient.post<{ success: boolean; expiresIn: number }>('/auth/send-otp', {
    phone,
    purpose,
  });
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (phone: string, code: string, purpose: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post<{ success: boolean }>('/auth/verify-otp', {
    phone,
    code,
    purpose,
  });
  return response.data;
};

/**
 * Verify age (18+)
 */
export const verifyAge = async (
  userId: string,
  birthDate: string,
  acceptTerms: boolean,
  acceptPrivacy: boolean,
): Promise<{ success: boolean; ageVerified: boolean }> => {
  const response = await apiClient.post<{ success: boolean; ageVerified: boolean }>('/auth/verify-age', {
    userId,
    birthDate,
    acceptTerms,
    acceptPrivacy,
  });
  return response.data;
};

/**
 * Start guest mode
 */
export const startGuestMode = async (deviceId?: string): Promise<{
  sessionToken: string;
  accessToken: string;
  expiresIn: number;
}> => {
  const response = await apiClient.post<{
    sessionToken: string;
    accessToken: string;
    expiresIn: number;
  }>('/auth/guest', {
    deviceId,
  });

  // Store guest token
  await Preferences.set({
    key: STORAGE_KEYS.JWT_TOKEN,
    value: response.data.accessToken,
  });

  return response.data;
};

/**
 * Create guest session (alias for startGuestMode)
 */
export const createGuestSession = startGuestMode;

/**
 * Validate admin secret code
 */
export const validateAdminSecret = async (
  secretCode: string,
  username: string,
  password: string,
): Promise<{ success: boolean; accessToken?: string; accessLevel?: string }> => {
  const response = await apiClient.post<{
    success: boolean;
    accessToken?: string;
    accessLevel?: string;
  }>('/auth/admin-secret', {
    secretCode,
    username,
    password,
  });

  if (response.data.accessToken) {
    // Store admin token
    await Preferences.set({
      key: STORAGE_KEYS.JWT_TOKEN,
      value: response.data.accessToken,
    });
  }

  return response.data;
};

/**
 * Authenticate with Google
 */
export const authenticateWithGoogle = async (
  idToken: string,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/google', {
    idToken,
  });

  if (response.data.access_token) {
    await Preferences.set({
      key: STORAGE_KEYS.JWT_TOKEN,
      value: response.data.access_token,
    });

    await Preferences.set({
      key: STORAGE_KEYS.USER_ID,
      value: response.data.user.id,
    });
  }

  return response.data;
};

/**
 * Authenticate with Apple
 */
export const authenticateWithApple = async (
  identityToken: string,
  authorizationCode?: string,
  user?: string,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/apple', {
    identityToken,
    authorizationCode,
    user,
  });

  if (response.data.access_token) {
    await Preferences.set({
      key: STORAGE_KEYS.JWT_TOKEN,
      value: response.data.access_token,
    });

    await Preferences.set({
      key: STORAGE_KEYS.USER_ID,
      value: response.data.user.id,
    });
  }

  return response.data;
};

/**
 * Convert guest session to full user account
 */
export const convertGuestToUser = async (data: RegisterData): Promise<AuthResponse> => {
  const currentToken = await getToken();
  
  const response = await apiClient.post<AuthResponse>('/auth/guest/convert', data, {
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  // Store new user tokens
  await Preferences.set({
    key: STORAGE_KEYS.JWT_TOKEN,
    value: response.data.access_token,
  });

  await Preferences.set({
    key: STORAGE_KEYS.USER_ID,
    value: response.data.user.id,
  });

  // Remove guest flag
  await Preferences.remove({ key: 'll_guest' });

  return response.data;
};

/**
 * Check if current session is guest
 */
export const isGuest = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: 'll_guest' });
  return value === 'true';
};
