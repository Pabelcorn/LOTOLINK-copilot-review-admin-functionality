import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('guest_sessions')
export class GuestSessionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'session_token', length: 255, unique: true })
  @Index()
  sessionToken!: string;

  @Column('varchar', { name: 'device_id', length: 255, nullable: true })
  @Index()
  deviceId?: string;

  @Column('jsonb', { name: 'device_info', nullable: true })
  deviceInfo?: Record<string, unknown>;

  @Column('timestamp with time zone', { name: 'last_activity', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity!: Date;

  @Column('timestamp with time zone', { name: 'expires_at' })
  @Index()
  expiresAt!: Date;

  @Column('uuid', { name: 'converted_to_user_id', nullable: true })
  convertedToUserId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
