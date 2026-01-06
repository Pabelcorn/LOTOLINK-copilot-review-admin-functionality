import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreferenceEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id', unique: true })
  @Index()
  userId!: string;

  @Column('boolean', { name: 'play_confirmed', default: true })
  playConfirmed!: boolean;

  @Column('boolean', { name: 'draw_reminder', default: true })
  drawReminder!: boolean;

  @Column('boolean', { name: 'draw_result', default: true })
  drawResult!: boolean;

  @Column('boolean', { name: 'prize_won', default: true })
  prizeWon!: boolean;

  @Column('boolean', { name: 'ticket_expiring', default: true })
  ticketExpiring!: boolean;

  @Column('boolean', { name: 'prize_paid', default: true })
  prizePaid!: boolean;

  @Column('boolean', { default: true })
  promotions!: boolean;

  @Column('integer', { name: 'reminder_minutes_before', default: 30 })
  reminderMinutesBefore!: number;

  @Column('time', { name: 'quiet_hours_start', nullable: true })
  quietHoursStart?: string;

  @Column('time', { name: 'quiet_hours_end', nullable: true })
  quietHoursEnd?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
