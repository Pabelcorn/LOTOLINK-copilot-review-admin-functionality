export interface NotificationLog {
  id?: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
}

export interface NotificationLogRepository {
  create(log: NotificationLog): Promise<NotificationLog>;
  update(id: string, updates: Partial<NotificationLog>): Promise<NotificationLog | null>;
  findByUserId(userId: string, limit?: number): Promise<NotificationLog[]>;
  countUnread(userId: string): Promise<number>;
}

export const NOTIFICATION_LOG_REPOSITORY = Symbol('NotificationLogRepository');
