import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('admin_secret_codes')
export class AdminSecretCodeEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, unique: true })
  @Index()
  code!: string;

  @Column('varchar', { name: 'code_hash', length: 255 })
  codeHash!: string;

  @Column('varchar', { name: 'access_level', length: 20 })
  accessLevel!: string; // 'super_admin', 'admin'

  @Column('boolean', { default: true })
  @Index()
  active!: boolean;

  @Column('integer', { name: 'rate_limit', default: 3 })
  rateLimit!: number;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column('timestamp with time zone', { name: 'deactivated_at', nullable: true })
  deactivatedAt?: Date;
}
