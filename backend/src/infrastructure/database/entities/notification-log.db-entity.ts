import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notification_logs')
export class NotificationLogEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId!: string;

  @Column('varchar', { length: 50 })
  @Index()
  type!: string;

  @Column('varchar', { length: 200 })
  title!: string;

  @Column('text')
  body!: string;

  @Column('jsonb', { default: {} })
  data!: Record<string, any>;

  @CreateDateColumn({ name: 'sent_at' })
  @Index()
  sentAt!: Date;

  @Column('timestamp with time zone', { name: 'delivered_at', nullable: true })
  deliveredAt?: Date;

  @Column('timestamp with time zone', { name: 'read_at', nullable: true })
  @Index()
  readAt?: Date;

  @Column('timestamp with time zone', { name: 'clicked_at', nullable: true })
  clickedAt?: Date;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage?: string;
}
