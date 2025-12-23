/**
 * API Service
 * Centralized HTTP client for all API requests
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Preferences } from '@capacitor/preferences';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const { value: token } = await Preferences.get({ key: STORAGE_KEYS.JWT_TOKEN });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      await Preferences.remove({ key: STORAGE_KEYS.JWT_TOKEN });
      await Preferences.remove({ key: STORAGE_KEYS.USER_ID });
      // Emit event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
