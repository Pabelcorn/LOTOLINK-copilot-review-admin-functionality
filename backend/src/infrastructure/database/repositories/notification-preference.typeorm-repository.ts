import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../../../domain/entities/notification-preference.entity';
import { NotificationPreferenceRepository } from '../../../domain/repositories/notification-preference.repository';
import { NotificationPreferenceEntity } from '../entities/notification-preference.db-entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TypeOrmNotificationPreferenceRepository implements NotificationPreferenceRepository {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly repository: Repository<NotificationPreferenceEntity>,
  ) {}

  async create(preference: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const entity = this.toEntity(preference);
    entity.id = entity.id || uuidv4();
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<NotificationPreference | null> {
    const entity = await this.repository.findOne({ where: { userId } });
    return entity ? this.toDomain(entity) : null;
  }

  async upsert(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference> {
    let entity = await this.repository.findOne({ where: { userId } });
    
    if (entity) {
      // Update existing
      await this.repository.update({ userId }, { ...updates, updatedAt: new Date() });
      entity = await this.repository.findOne({ where: { userId } });
    } else {
      // Create new
      entity = this.toEntity({ ...updates, userId, id: uuidv4() });
      entity = await this.repository.save(entity);
    }
    
    return this.toDomain(entity!);
  }

  private toEntity(preference: Partial<NotificationPreference>): NotificationPreferenceEntity {
    const entity = new NotificationPreferenceEntity();
    if (preference.id) entity.id = preference.id;
    if (preference.userId) entity.userId = preference.userId;
    if (preference.playConfirmed !== undefined) entity.playConfirmed = preference.playConfirmed;
    if (preference.drawReminder !== undefined) entity.drawReminder = preference.drawReminder;
    if (preference.drawResult !== undefined) entity.drawResult = preference.drawResult;
    if (preference.prizeWon !== undefined) entity.prizeWon = preference.prizeWon;
    if (preference.ticketExpiring !== undefined) entity.ticketExpiring = preference.ticketExpiring;
    if (preference.prizePaid !== undefined) entity.prizePaid = preference.prizePaid;
    if (preference.promotions !== undefined) entity.promotions = preference.promotions;
    if (preference.reminderMinutesBefore !== undefined) entity.reminderMinutesBefore = preference.reminderMinutesBefore;
    if (preference.quietHoursStart !== undefined) entity.quietHoursStart = preference.quietHoursStart;
    if (preference.quietHoursEnd !== undefined) entity.quietHoursEnd = preference.quietHoursEnd;
    if (preference.createdAt) entity.createdAt = preference.createdAt;
    if (preference.updatedAt) entity.updatedAt = preference.updatedAt;
    return entity;
  }

  private toDomain(entity: NotificationPreferenceEntity): NotificationPreference {
    return new NotificationPreference({
      id: entity.id,
      userId: entity.userId,
      playConfirmed: entity.playConfirmed,
      drawReminder: entity.drawReminder,
      drawResult: entity.drawResult,
      prizeWon: entity.prizeWon,
      ticketExpiring: entity.ticketExpiring,
      prizePaid: entity.prizePaid,
      promotions: entity.promotions,
      reminderMinutesBefore: entity.reminderMinutesBefore,
      quietHoursStart: entity.quietHoursStart,
      quietHoursEnd: entity.quietHoursEnd,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
