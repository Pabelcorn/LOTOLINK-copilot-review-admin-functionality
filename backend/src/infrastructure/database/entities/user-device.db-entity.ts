import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_devices')
export class UserDeviceEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId!: string;

  @Column('varchar', { name: 'fcm_token', length: 500 })
  fcmToken!: string;

  @Column('varchar', { name: 'device_type', length: 20 })
  @Index()
  deviceType!: string;

  @Column('varchar', { name: 'device_name', length: 100, nullable: true })
  deviceName?: string;

  @Column('varchar', { name: 'device_model', length: 100, nullable: true })
  deviceModel?: string;

  @Column('varchar', { name: 'os_version', length: 50, nullable: true })
  osVersion?: string;

  @Column('varchar', { name: 'app_version', length: 20, nullable: true })
  appVersion?: string;

  @Column('boolean', { name: 'is_active', default: true })
  @Index()
  isActive!: boolean;

  @Column('timestamp with time zone', { name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
