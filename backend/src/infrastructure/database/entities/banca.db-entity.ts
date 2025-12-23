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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
