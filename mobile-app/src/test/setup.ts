/**
 * Test setup file
 */

import '@testing-library/jest-dom';

// Mock Capacitor
(global as any).Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web',
};
