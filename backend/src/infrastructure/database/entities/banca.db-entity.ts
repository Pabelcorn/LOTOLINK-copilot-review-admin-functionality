import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('bancas')
export class BancaEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar')
  @Index()
  name!: string;

  @Column('varchar', { name: 'integration_type' })
  integrationType!: string;

  @Column('varchar', { nullable: true })
  endpoint?: string;

  @Column('varchar', { name: 'auth_type' })
  authType!: string;

  @Column('varchar', { name: 'client_id', nullable: true })
  clientId?: string;

  @Column('varchar', { nullable: true })
  secret?: string;

  @Column('text', { name: 'public_key', nullable: true })
  publicKey?: string;

  @Column('integer', { name: 'sla_ms', default: 5000 })
  slaMs!: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('varchar', { nullable: true })
  rnc?: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('varchar', { nullable: true })
  @Index()
  email?: string;

  @Column('varchar', { default: 'pending' })
  @Index()
  status!: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true, name: 'commission_percentage' })
  commissionPercentage?: number;

  @Column('varchar', { nullable: true, name: 'commission_stripe_account_id' })
  commissionStripeAccountId?: string;

  @Column('varchar', { nullable: true, name: 'card_processing_account_id' })
  cardProcessingAccountId?: string;

  @Column('uuid', { nullable: true, name: 'owner_id' })
  @Index()
  ownerId?: string;

  @Column('varchar', { length: 20, nullable: true, name: 'branch_code' })
  branchCode?: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  city?: string;

  @Column('varchar', { length: 100, nullable: true })
  region?: string;

  @Column('varchar', { length: 2, default: 'DO' })
  @Index()
  country!: string;

  @Column('varchar', { length: 50, default: 'America/Santo_Domingo' })
  timezone!: string;

  @Column('jsonb', { nullable: true, name: 'operating_hours' })
  operatingHours?: Record<string, any>;

  @Column('boolean', { default: false, name: 'is_main_branch' })
  isMainBranch!: boolean;

  @Column('boolean', { default: true, name: 'accepts_cash' })
  acceptsCash!: boolean;

  @Column('boolean', { default: true, name: 'accepts_card' })
  acceptsCard!: boolean;

  @Column('boolean', { default: false, name: 'accepts_transfer' })
  acceptsTransfer!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
