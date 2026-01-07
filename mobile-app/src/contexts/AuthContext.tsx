/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as AuthService from '../services/auth.service';
import { User } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  startGuestMode: (deviceId?: string) => Promise<void>;
  convertGuestToUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is in guest mode
  const isGuest = user?.role === 'guest' || false;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      
      if (authenticated) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({ phone, password });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, phone: string, password: string, email?: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({ name, phone, password, email });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const startGuestMode = async (deviceId?: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.startGuestMode(deviceId);
      // Create a minimal guest user object
      setUser({
        id: 'guest-' + Date.now(),
        phone: '',
        name: 'Guest',
        role: 'guest',
      });
      setIsAuthenticated(false); // Guest is not authenticated
    } catch (error) {
      console.error('Failed to start guest mode:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const convertGuestToUser = async () => {
    // This will be called after successful registration from guest mode
    // The register function already handles setting the user
    setIsAuthenticated(true);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    startGuestMode,
    convertGuestToUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
