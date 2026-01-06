import { NotificationPreference } from '../entities/notification-preference.entity';

export interface NotificationPreferenceRepository {
  create(preference: Partial<NotificationPreference>): Promise<NotificationPreference>;
  findByUserId(userId: string): Promise<NotificationPreference | null>;
  upsert(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference>;
}

export const NOTIFICATION_PREF_REPOSITORY = Symbol('NotificationPreferenceRepository');
