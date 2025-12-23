/**
 * Application Constants
 * Central location for all app-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 10000,
} as const;

// App Information
export const APP_INFO = {
  NAME: 'LotoLink',
  VERSION: '1.0.0', // Should match package.json version
  COPYRIGHT_YEAR: new Date().getFullYear(),
  COMPANY: 'LotoLink Team',
} as const;

// Default Values
export const DEFAULTS = {
  LOTTERY_ID: 'leidsa',
  MIN_BET_AMOUNT: 1,
  DEFAULT_BET_AMOUNT: 10,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: '#0071e3',
  SUCCESS: '#34c759',
  WARNING: '#ff9f0a',
  DANGER: '#ff3b30',
  PURPLE: '#af52de',
} as const;

// Native Feature Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_ID: 'user_id',
  DARK_MODE: 'dark_mode_enabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

// Lottery Games Configuration
export const LOTTERY_GAMES = {
  QUINIELA: {
    id: 'quiniela',
    name: 'Quiniela',
    pickCount: 1,
    maxNumber: 99,
  },
  PALE: {
    id: 'pale',
    name: 'Palé',
    pickCount: 2,
    maxNumber: 99,
  },
  TRIPLETA: {
    id: 'tripleta',
    name: 'Tripleta',
    pickCount: 3,
    maxNumber: 99,
  },
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;
