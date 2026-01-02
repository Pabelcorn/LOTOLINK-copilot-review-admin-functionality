import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('bet_types')
export class BetTypeEntity {
  @PrimaryColumn('varchar', { length: 50 })
  id!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('integer', { name: 'numbers_required' })
  numbersRequired!: number;

  @Column('boolean', { name: 'numbers_ordered', default: false })
  numbersOrdered!: boolean;

  @Column('decimal', { precision: 10, scale: 2, name: 'default_prize_multiplier' })
  defaultPrizeMultiplier!: number;

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
