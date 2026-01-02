import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';
import { LotteryDrawEntity } from './lottery-draw.db-entity';

@Entity('banca_draws')
export class BancaDrawEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @ManyToOne(() => BancaEntity)
  @JoinColumn({ name: 'banca_id' })
  banca?: BancaEntity;

  @Column('uuid', { name: 'lottery_draw_id' })
  @Index()
  lotteryDrawId!: string;

  @ManyToOne(() => LotteryDrawEntity)
  @JoinColumn({ name: 'lottery_draw_id' })
  lotteryDraw?: LotteryDrawEntity;

  @Column('boolean', { default: true, name: 'is_enabled' })
  @Index()
  isEnabled!: boolean;

  @Column('integer', { nullable: true, name: 'custom_close_before_minutes' })
  customCloseBeforeMinutes?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
