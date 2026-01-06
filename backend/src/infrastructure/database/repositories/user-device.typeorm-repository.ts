import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from '../../../domain/entities/user-device.entity';
import { UserDeviceRepository } from '../../../domain/repositories/user-device.repository';
import { UserDeviceEntity } from '../entities/user-device.db-entity';

@Injectable()
export class TypeOrmUserDeviceRepository implements UserDeviceRepository {
  constructor(
    @InjectRepository(UserDeviceEntity)
    private readonly repository: Repository<UserDeviceEntity>,
  ) {}

  async create(device: UserDevice): Promise<UserDevice> {
    const entity = this.toEntity(device);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, updates: Partial<UserDevice>): Promise<UserDevice | null> {
    await this.repository.update(id, this.toEntity(updates as UserDevice));
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByToken(fcmToken: string): Promise<UserDevice | null> {
    const entity = await this.repository.findOne({ where: { fcmToken } });
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserDevice[]> {
    const entities = await this.repository.find({
      where: { userId, isActive: true },
    });
    return entities.map(e => this.toDomain(e));
  }

  async deactivate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false, updatedAt: new Date() });
  }

  private toEntity(device: Partial<UserDevice>): Partial<UserDeviceEntity> {
    const entity: Partial<UserDeviceEntity> = {};
    if (device.id) entity.id = device.id;
    if (device.userId) entity.userId = device.userId;
    if (device.fcmToken) entity.fcmToken = device.fcmToken;
    if (device.deviceType) entity.deviceType = device.deviceType;
    if (device.deviceName !== undefined) entity.deviceName = device.deviceName;
    if (device.deviceModel !== undefined) entity.deviceModel = device.deviceModel;
    if (device.osVersion !== undefined) entity.osVersion = device.osVersion;
    if (device.appVersion !== undefined) entity.appVersion = device.appVersion;
    if (device.isActive !== undefined) entity.isActive = device.isActive;
    if (device.lastUsedAt !== undefined) entity.lastUsedAt = device.lastUsedAt;
    if (device.createdAt) entity.createdAt = device.createdAt;
    if (device.updatedAt) entity.updatedAt = device.updatedAt;
    return entity;
  }

  private toDomain(entity: UserDeviceEntity): UserDevice {
    return new UserDevice({
      id: entity.id,
      userId: entity.userId,
      fcmToken: entity.fcmToken,
      deviceType: entity.deviceType as any,
      deviceName: entity.deviceName,
      deviceModel: entity.deviceModel,
      osVersion: entity.osVersion,
      appVersion: entity.appVersion,
      isActive: entity.isActive,
      lastUsedAt: entity.lastUsedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
