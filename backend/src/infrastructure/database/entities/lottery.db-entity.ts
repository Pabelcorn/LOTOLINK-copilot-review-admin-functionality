import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('lotteries')
export class LotteryEntity {
  @PrimaryColumn('varchar', { length: 50 })
  id!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('varchar', { length: 50, nullable: true, name: 'short_name' })
  shortName?: string;

  @Column('varchar', { length: 2, default: 'DO' })
  @Index()
  country!: string;

  @Column('varchar', { length: 500, nullable: true, name: 'logo_url' })
  logoUrl?: string;

  @Column('varchar', { length: 500, nullable: true, name: 'website_url' })
  websiteUrl?: string;

  @Column('integer', { default: 0, name: 'number_range_min' })
  numberRangeMin!: number;

  @Column('integer', { default: 99, name: 'number_range_max' })
  numberRangeMax!: number;

  @Column('varchar', { length: 20, default: 'active' })
  @Index()
  status!: string;

  @Column('integer', { default: 0, name: 'display_order' })
  @Index()
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
