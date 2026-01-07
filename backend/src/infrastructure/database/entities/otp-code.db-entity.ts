import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('otp_codes')
export class OtpCodeEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { length: 20 })
  @Index()
  phone!: string;

  @Column('varchar', { length: 6 })
  @Index()
  code!: string;

  @Column('varchar', { length: 50 })
  purpose!: string; // 'registration', 'login', 'verification'

  @Column('integer', { default: 0 })
  attempts!: number;

  @Column('integer', { name: 'max_attempts', default: 5 })
  maxAttempts!: number;

  @Column('boolean', { default: false })
  @Index()
  verified!: boolean;

  @Column('timestamp with time zone', { name: 'expires_at' })
  @Index()
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column('timestamp with time zone', { name: 'verified_at', nullable: true })
  verifiedAt?: Date;
}
