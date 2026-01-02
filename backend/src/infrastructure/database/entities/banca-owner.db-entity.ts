import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('banca_owners')
export class BancaOwnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 100, name: 'first_name' })
  firstName!: string;

  @Column('varchar', { length: 100, name: 'last_name' })
  lastName!: string;

  @Column('varchar', { length: 255, unique: true })
  @Index()
  email!: string;

  @Column('varchar', { length: 20, nullable: true })
  phone?: string;

  @Column('varchar', { length: 20, nullable: true })
  @Index()
  cedula?: string;

  @Column('varchar', { length: 20, nullable: true })
  @Index()
  rnc?: string;

  @Column('varchar', { length: 255, nullable: true, name: 'business_name' })
  businessName?: string;

  @Column('varchar', { length: 100, nullable: true, name: 'bank_name' })
  bankName?: string;

  @Column('varchar', { length: 20, nullable: true, name: 'bank_account_type' })
  bankAccountType?: string;

  @Column('varchar', { length: 50, nullable: true, name: 'bank_account_number' })
  bankAccountNumber?: string;

  @Column('varchar', { length: 100, nullable: true, name: 'stripe_account_id' })
  stripeAccountId?: string;

  @Column('decimal', { precision: 5, scale: 4, default: 0.05, name: 'default_commission_percentage' })
  defaultCommissionPercentage!: number;

  @Column('varchar', { length: 20, default: 'pending' })
  @Index()
  status!: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('jsonb', { default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
