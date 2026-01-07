import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true })
  @Index()
  phone!: string;

  @Column('varchar', { nullable: true })
  @Index()
  email?: string;

  @Column('varchar', { nullable: true })
  name?: string;

  @Column('varchar', { nullable: true, select: false })
  password?: string;

  @Column('varchar', { default: 'user' })
  @Index()
  role!: string;

  @Column('decimal', { name: 'wallet_balance', precision: 12, scale: 2, default: 0 })
  walletBalance!: number;

  @Column('date', { name: 'birth_date', nullable: true })
  birthDate?: Date;

  @Column('boolean', { name: 'age_verified', default: false })
  ageVerified!: boolean;

  @Column('boolean', { name: 'is_guest', default: false })
  @Index()
  isGuest!: boolean;

  @Column('timestamp with time zone', { name: 'guest_expires_at', nullable: true })
  guestExpiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
