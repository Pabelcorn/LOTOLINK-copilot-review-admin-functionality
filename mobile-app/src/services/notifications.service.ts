/**
 * Push Notifications Service
 * Handles push notification registration and handling
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Preferences } from '@capacitor/preferences';

const FCM_TOKEN_KEY = 'fcm_token';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async (): Promise<void> => {
  try {
    // Request permissions
    const permissionResult = await PushNotifications.requestPermissions();
    
    if (permissionResult.receive === 'granted') {
      await PushNotifications.register();
      
      // Get FCM token
      const { token } = await FirebaseMessaging.getToken();
      
      // Save token
      await Preferences.set({
        key: FCM_TOKEN_KEY,
        value: token,
      });
      
      console.log('Push notifications initialized. FCM Token:', token);
    } else {
      console.warn('Push notification permission denied');
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: FCM_TOKEN_KEY });
    return value;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Subscribe to topic
 */
export const subscribeToTopic = async (topic: string): Promise<void> => {
  try {
    await FirebaseMessaging.subscribeToTopic({ topic });
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Failed to subscribe to topic ${topic}:`, error);
  }
};

/**
 * Unsubscribe from topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  try {
    await FirebaseMessaging.unsubscribeFromTopic({ topic });
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Failed to unsubscribe from topic ${topic}:`, error);
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: NotificationPayload) => void,
  onNotificationClicked?: (notification: NotificationPayload) => void
): void => {
  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    
    if (onNotificationReceived) {
      onNotificationReceived({
        title: notification.title || '',
        body: notification.body || '',
        data: notification.data,
      });
    }
  });

  // Notification clicked (app opened from notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification clicked:', notification);
    
    if (onNotificationClicked) {
      onNotificationClicked({
        title: notification.notification.title || '',
        body: notification.notification.body || '',
        data: notification.notification.data,
      });
    }
  });

  // Token registration
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success, token:', token.value);
    
    await Preferences.set({
      key: FCM_TOKEN_KEY,
      value: token.value,
    });
  });

  // Registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });
};

/**
 * Remove all notification listeners
 */
export const removeNotificationListeners = async (): Promise<void> => {
  await PushNotifications.removeAllListeners();
};

/**
 * Check notification permissions
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const result = await PushNotifications.checkPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Failed to check notification permissions:', error);
    return false;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};

/**
 * Send FCM token to backend
 */
export const registerTokenWithBackend = async (
  apiClient: any,
  userId: string
): Promise<void> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      console.warn('No FCM token available');
      return;
    }
    
    await apiClient.post('/users/register-device', {
      user_id: userId,
      device_token: token,
      platform: 'mobile',
    });
    
    console.log('Device token registered with backend');
  } catch (error) {
    console.error('Failed to register device token with backend:', error);
  }
};
