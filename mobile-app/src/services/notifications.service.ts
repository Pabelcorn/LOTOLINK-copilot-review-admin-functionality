import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

class NotificationsService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (Capacitor.getPlatform() === 'web') {
      return this.initializeWeb();
    }

    try {
      // Dynamic import for Capacitor plugins
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        console.log('Push notifications permission denied');
        return false;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success:', token.value);
        await this.saveTokenToServer(token.value);
        await Preferences.set({ key: 'fcm_token', value: token.value });
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received in foreground:', notification);
        this.showLocalNotification(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed:', action);
        this.handleNotificationTap(action.notification);
      });

      this.initialized = true;
      return true;
      
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  private async initializeWeb(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    this.initialized = true;
    return true;
  }

  private async saveTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fcmToken: token,
          deviceType: Capacitor.getPlatform(),
          deviceName: navigator.userAgent.substring(0, 100),
          osVersion: navigator.platform,
          appVersion: '1.0.0',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register device');
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  private async showLocalNotification(notification: any): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: notification.title || 'LotoLink',
          body: notification.body || '',
          extra: notification.data,
          smallIcon: 'ic_notification',
          iconColor: '#0071e3',
        }],
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  private handleNotificationTap(notification: any): void {
    const data = notification.data;
    
    switch (data?.type) {
      case 'play_confirmed':
      case 'ticket_expiring':
        window.location.href = `/ticket/${data.ticketCode}`;
        break;
        
      case 'prize_won':
      case 'prize_paid':
        window.location.href = '/my-tickets?filter=won';
        break;
        
      case 'draw_result':
        window.location.href = '/results';
        break;
        
      case 'draw_reminder':
        window.location.href = '/play';
        break;
        
      default:
        window.location.href = '/home';
    }
  }

  async unregister(): Promise<void> {
    const { value: token } = await Preferences.get({ key: 'fcm_token' });
    if (token) {
      try {
        await fetch(`/api/v1/notifications/devices/${encodeURIComponent(token)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        await Preferences.remove({ key: 'fcm_token' });
      } catch (error) {
        console.error('Error unregistering device:', error);
      }
    }

    if (Capacitor.getPlatform() !== 'web') {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.removeAllListeners();
    }
    
    this.initialized = false;
  }

  async getHistory(): Promise<any[]> {
    const response = await fetch('/api/v1/notifications/history', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  }

  async getPreferences(): Promise<any> {
    const response = await fetch('/api/v1/notifications/preferences', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  }

  async updatePreferences(prefs: any): Promise<void> {
    await fetch('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(prefs),
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await fetch(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch('/api/v1/notifications/unread-count', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    return data.count;
  }
}

export const notificationsService = new NotificationsService();
