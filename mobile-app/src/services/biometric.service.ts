/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from '../constants';

export interface BiometricInfo {
  isAvailable: boolean;
  biometryType: BiometryType;
  hasCredentials: boolean;
}

/**
 * Check if biometric authentication is available
 */
export const checkBiometricAvailability = async (): Promise<BiometricInfo> => {
  try {
    const result = await NativeBiometric.isAvailable();
    
    return {
      isAvailable: result.isAvailable,
      biometryType: result.biometryType,
      hasCredentials: result.isAvailable,
    };
  } catch (error) {
    console.error('Biometric check failed:', error);
    return {
      isAvailable: false,
      biometryType: BiometryType.NONE,
      hasCredentials: false,
    };
  }
};

/**
 * Get biometric type name for display
 */
export const getBiometricTypeName = (biometryType: BiometryType): string => {
  switch (biometryType) {
    case BiometryType.FACE_ID:
      return 'Face ID';
    case BiometryType.TOUCH_ID:
      return 'Touch ID';
    case BiometryType.FINGERPRINT:
      return 'Huella Digital';
    case BiometryType.FACE_AUTHENTICATION:
      return 'Reconocimiento Facial';
    case BiometryType.IRIS_AUTHENTICATION:
      return 'Reconocimiento de Iris';
    default:
      return 'Biométrico';
  }
};

/**
 * Authenticate user with biometrics
 */
export const authenticateWithBiometrics = async (
  reason: string = 'Para acceder a tu cuenta'
): Promise<boolean> => {
  try {
    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Autenticación',
      subtitle: 'LotoLink',
      description: 'Confirma tu identidad para continuar',
    });
    
    return true;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};

/**
 * Save credentials for biometric authentication
 */
export const saveBiometricCredentials = async (
  username: string,
  password: string
): Promise<void> => {
  try {
    await NativeBiometric.setCredentials({
      username,
      password,
      server: 'lotolink.app',
    });
    
    await Preferences.set({
      key: STORAGE_KEYS.BIOMETRIC_ENABLED,
      value: 'true',
    });
  } catch (error) {
    console.error('Failed to save biometric credentials:', error);
    throw error;
  }
};

/**
 * Get saved biometric credentials
 */
export const getBiometricCredentials = async (): Promise<{
  username: string;
  password: string;
} | null> => {
  try {
    const credentials = await NativeBiometric.getCredentials({
      server: 'lotolink.app',
    });
    
    return {
      username: credentials.username,
      password: credentials.password,
    };
  } catch (error) {
    console.error('Failed to get biometric credentials:', error);
    return null;
  }
};

/**
 * Delete saved biometric credentials
 */
export const deleteBiometricCredentials = async (): Promise<void> => {
  try {
    await NativeBiometric.deleteCredentials({
      server: 'lotolink.app',
    });
    
    await Preferences.remove({ key: STORAGE_KEYS.BIOMETRIC_ENABLED });
  } catch (error) {
    console.error('Failed to delete biometric credentials:', error);
  }
};

/**
 * Check if biometric login is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: STORAGE_KEYS.BIOMETRIC_ENABLED });
  return value === 'true';
};

/**
 * Enable biometric login
 */
export const enableBiometricLogin = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {
    const info = await checkBiometricAvailability();
    
    if (!info.isAvailable) {
      throw new Error('Biometric authentication not available');
    }
    
    // Verify biometric first
    const authenticated = await authenticateWithBiometrics(
      'Confirma tu identidad para habilitar autenticación biométrica'
    );
    
    if (!authenticated) {
      return false;
    }
    
    // Save credentials
    await saveBiometricCredentials(username, password);
    
    return true;
  } catch (error) {
    console.error('Failed to enable biometric login:', error);
    return false;
  }
};

/**
 * Disable biometric login
 */
export const disableBiometricLogin = async (): Promise<void> => {
  await deleteBiometricCredentials();
};
