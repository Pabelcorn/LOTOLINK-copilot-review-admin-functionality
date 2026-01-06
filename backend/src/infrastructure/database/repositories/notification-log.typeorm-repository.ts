import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { NotificationLog, NotificationLogRepository } from '../../../domain/repositories/notification-log.repository';
import { NotificationLogEntity } from '../entities/notification-log.db-entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TypeOrmNotificationLogRepository implements NotificationLogRepository {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly repository: Repository<NotificationLogEntity>,
  ) {}

  async create(log: NotificationLog): Promise<NotificationLog> {
    const entity = this.toEntity(log);
    entity.id = entity.id || uuidv4();
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<NotificationLog>): Promise<NotificationLog | null> {
    await this.repository.update(id, updates);
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string, limit = 50): Promise<NotificationLog[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      take: limit,
    });
    return entities.map(e => this.toDomain(e));
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        readAt: IsNull(),
      },
    });
  }

  private toEntity(log: NotificationLog): NotificationLogEntity {
    const entity = new NotificationLogEntity();
    if (log.id) entity.id = log.id;
    entity.userId = log.userId;
    entity.type = log.type;
    entity.title = log.title;
    entity.body = log.body;
    entity.data = log.data || {};
    if (log.sentAt) entity.sentAt = log.sentAt;
    if (log.deliveredAt) entity.deliveredAt = log.deliveredAt;
    if (log.readAt) entity.readAt = log.readAt;
    if (log.clickedAt) entity.clickedAt = log.clickedAt;
    if (log.errorMessage) entity.errorMessage = log.errorMessage;
    return entity;
  }

  private toDomain(entity: NotificationLogEntity): NotificationLog {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      title: entity.title,
      body: entity.body,
      data: entity.data,
      sentAt: entity.sentAt,
      deliveredAt: entity.deliveredAt,
      readAt: entity.readAt,
      clickedAt: entity.clickedAt,
      errorMessage: entity.errorMessage,
    };
  }
}
