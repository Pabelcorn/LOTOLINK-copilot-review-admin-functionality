import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sucursales')
export class SucursalEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('varchar', { length: 50 })
  @Index()
  code!: string;

  @Column('varchar', { length: 255, nullable: true })
  address?: string;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  city?: string;

  @Column('varchar', { length: 100, nullable: true })
  province?: string;

  @Column('varchar', { length: 50, nullable: true })
  phone?: string;

  @Column('varchar', { length: 20, nullable: true, name: 'operator_prefix' })
  operatorPrefix?: string;

  @Column('boolean', { name: 'is_active', default: true })
  @Index()
  isActive!: boolean;

  @Column('jsonb', { name: 'ticket_config', default: {} })
  ticketConfig!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
