import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserDeviceRepository, USER_DEVICE_REPOSITORY } from '../../domain/repositories/user-device.repository';
import { NotificationLogRepository, NOTIFICATION_LOG_REPOSITORY } from '../../domain/repositories/notification-log.repository';
import { NotificationPreferenceRepository, NOTIFICATION_PREF_REPOSITORY } from '../../domain/repositories/notification-preference.repository';
import { UserDevice } from '../../domain/entities/user-device.entity';

export enum NotificationType {
  PLAY_CONFIRMED = 'play_confirmed',
  DRAW_REMINDER = 'draw_reminder',
  DRAW_RESULT = 'draw_result',
  PRIZE_WON = 'prize_won',
  TICKET_EXPIRING = 'ticket_expiring',
  PRIZE_PAID = 'prize_paid',
  PROMOTION = 'promotion',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class NotificationService {
  private firebaseApp: admin.app.App | null = null;

  constructor(
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: UserDeviceRepository,
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepository: NotificationLogRepository,
    @Inject(NOTIFICATION_PREF_REPOSITORY)
    private readonly prefRepository: NotificationPreferenceRepository,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }

  async sendToUser(payload: NotificationPayload): Promise<boolean> {
    // Check user preferences
    const prefs = await this.prefRepository.findByUserId(payload.userId);
    if (prefs && !this.isNotificationEnabled(prefs, payload.type)) {
      console.log(`Notification ${payload.type} disabled for user ${payload.userId}`);
      return false;
    }

    // Check quiet hours
    if (prefs?.isInQuietHours() && payload.type !== NotificationType.PRIZE_WON) {
      console.log(`User ${payload.userId} is in quiet hours`);
      return false;
    }

    // Get user's active devices
    const devices = await this.deviceRepository.findActiveByUserId(payload.userId);
    if (!devices.length) {
      console.log(`No active devices for user ${payload.userId}`);
      return false;
    }

    const tokens = devices.map((d: UserDevice) => d.fcmToken);

    if (!this.firebaseApp) {
      // Log notification even without FCM for development
      await this.logRepository.create({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sentAt: new Date(),
      });
      console.log('FCM not configured - notification logged only');
      return true;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: {
        type: payload.type,
        click_action: 'NOTIFICATION_CLICK',
        ...payload.data,
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#0071e3',
          sound: 'default',
          channelId: 'lotolink_default',
        },
      },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'mutable-content': 1,
          },
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          icon: '/assets/icon/icon-192.png',
          badge: '/assets/icon/badge-72.png',
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      
      await this.logRepository.create({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sentAt: new Date(),
      });

      if (response.failureCount > 0) {
        await this.handleFailedTokens(devices, response.responses);
      }

      console.log(`Sent ${response.successCount}/${tokens.length} notifications`);
      return response.successCount > 0;
      
    } catch (error: any) {
      console.error('Error sending notification:', error);
      await this.logRepository.create({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sentAt: new Date(),
        errorMessage: error.message,
      });
      return false;
    }
  }

  private isNotificationEnabled(prefs: any, type: NotificationType): boolean {
    const mapping: Record<NotificationType, string> = {
      [NotificationType.PLAY_CONFIRMED]: 'playConfirmed',
      [NotificationType.DRAW_REMINDER]: 'drawReminder',
      [NotificationType.DRAW_RESULT]: 'drawResult',
      [NotificationType.PRIZE_WON]: 'prizeWon',
      [NotificationType.TICKET_EXPIRING]: 'ticketExpiring',
      [NotificationType.PRIZE_PAID]: 'prizePaid',
      [NotificationType.PROMOTION]: 'promotions',
    };
    return prefs[mapping[type]] as boolean;
  }

  private async handleFailedTokens(devices: UserDevice[], responses: admin.messaging.SendResponse[]): Promise<void> {
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].success) {
        const error = responses[i].error;
        if (
          error?.code === 'messaging/invalid-registration-token' ||
          error?.code === 'messaging/registration-token-not-registered'
        ) {
          await this.deviceRepository.deactivate(devices[i].id);
        }
      }
    }
  }

  // ========== Convenience Methods ==========

  async notifyPlayConfirmed(userId: string, ticketCode: string, lotteryName: string): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.PLAY_CONFIRMED,
      title: '✅ Jugada Confirmada',
      body: `Tu jugada ${ticketCode} para ${lotteryName} fue confirmada.`,
      data: { ticketCode },
    });
  }

  async notifyDrawReminder(userId: string, lotteryName: string, drawTime: string): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.DRAW_REMINDER,
      title: '⏰ Sorteo Próximo',
      body: `El sorteo de ${lotteryName} es a las ${drawTime}. ¡Juega ahora!`,
      data: { lotteryName },
    });
  }

  async notifyDrawResult(userId: string, lotteryName: string, sorteoNumber: string, winningNumbers: string): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.DRAW_RESULT,
      title: `🎱 Resultados ${lotteryName}`,
      body: `Sorteo #${sorteoNumber}: ${winningNumbers}`,
      data: { lotteryName, sorteoNumber, winningNumbers },
    });
  }

  async notifyPrizeWon(userId: string, ticketCode: string, prizeAmount: number): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.PRIZE_WON,
      title: '🎉 ¡FELICIDADES! ¡GANASTE!',
      body: `Tu ticket ${ticketCode} ganó RD$ ${prizeAmount.toLocaleString()}!`,
      data: { ticketCode, prizeAmount: prizeAmount.toString() },
    });
  }

  async notifyTicketExpiring(userId: string, ticketCode: string, daysLeft: number): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.TICKET_EXPIRING,
      title: '⚠️ Ticket por Vencer',
      body: `Tu ticket ${ticketCode} vence en ${daysLeft} días. ¡Cobra tu premio!`,
      data: { ticketCode, daysLeft: daysLeft.toString() },
    });
  }

  async notifyPrizePaid(userId: string, ticketCode: string, amount: number): Promise<void> {
    await this.sendToUser({
      userId,
      type: NotificationType.PRIZE_PAID,
      title: '💵 Premio Pagado',
      body: `Se procesó tu pago de RD$ ${amount.toLocaleString()} por ticket ${ticketCode}.`,
      data: { ticketCode, amount: amount.toString() },
    });
  }

  // ========== Device Management ==========

  async registerDevice(userId: string, dto: any): Promise<UserDevice> {
    const existing = await this.deviceRepository.findByToken(dto.fcmToken);
    if (existing) {
      return (await this.deviceRepository.update(existing.id, {
        ...existing,
        userId,
        isActive: true,
        lastUsedAt: new Date(),
        ...dto,
      }))!;
    }
    return this.deviceRepository.create(
      new UserDevice({
        userId,
        ...dto,
        isActive: true,
      })
    );
  }

  async unregisterDevice(fcmToken: string): Promise<void> {
    const device = await this.deviceRepository.findByToken(fcmToken);
    if (device) {
      await this.deviceRepository.deactivate(device.id);
    }
  }

  // ========== Preferences ==========

  async getPreferences(userId: string): Promise<any> {
    let prefs = await this.prefRepository.findByUserId(userId);
    if (!prefs) {
      prefs = await this.prefRepository.create({ userId });
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: any): Promise<any> {
    return this.prefRepository.upsert(userId, dto);
  }

  // ========== Notification History ==========

  async getNotificationHistory(userId: string, limit = 50): Promise<any[]> {
    return this.logRepository.findByUserId(userId, limit);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.logRepository.update(notificationId, { readAt: new Date() });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.logRepository.countUnread(userId);
  }
}
