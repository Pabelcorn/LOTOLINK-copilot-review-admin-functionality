import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { LotteryEntity } from './lottery.db-entity';

@Entity('lottery_draws')
export class LotteryDrawEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50, name: 'lottery_id' })
  @Index()
  lotteryId!: string;

  @ManyToOne(() => LotteryEntity)
  @JoinColumn({ name: 'lottery_id' })
  lottery?: LotteryEntity;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('varchar', { length: 50 })
  code!: string;

  @Column('time', { name: 'draw_time' })
  @Index()
  drawTime!: string;

  @Column('integer', { array: true, name: 'days_of_week', default: '{1,2,3,4,5,6,7}' })
  daysOfWeek!: number[];

  @Column('integer', { default: 15, name: 'close_before_minutes' })
  closeBeforeMinutes!: number;

  @Column('varchar', { length: 20, default: 'active' })
  @Index()
  status!: string;

  @Column('integer', { default: 0, name: 'display_order' })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
