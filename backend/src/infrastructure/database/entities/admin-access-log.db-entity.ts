import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('admin_access_logs')
export class AdminAccessLogEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'secret_code', length: 50 })
  @Index()
  secretCode!: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column('varchar', { length: 100, nullable: true })
  username?: string;

  @Column('boolean')
  @Index()
  success!: boolean;

  @Column('varchar', { name: 'ip_address', length: 45, nullable: true })
  @Index()
  ipAddress?: string;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'accessed_at' })
  @Index()
  accessedAt!: Date;
}
