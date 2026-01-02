import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';
import { LotteryEntity } from './lottery.db-entity';
import { LotteryDrawEntity } from './lottery-draw.db-entity';
import { BetTypeEntity } from './bet-type.db-entity';

@Entity('banca_number_limits')
export class BancaNumberLimitEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @ManyToOne(() => BancaEntity)
  @JoinColumn({ name: 'banca_id' })
  banca?: BancaEntity;

  @Column('varchar', { length: 50, name: 'lottery_id' })
  @Index()
  lotteryId!: string;

  @ManyToOne(() => LotteryEntity)
  @JoinColumn({ name: 'lottery_id' })
  lottery?: LotteryEntity;

  @Column('uuid', { nullable: true, name: 'lottery_draw_id' })
  @Index()
  lotteryDrawId?: string;

  @ManyToOne(() => LotteryDrawEntity)
  @JoinColumn({ name: 'lottery_draw_id' })
  lotteryDraw?: LotteryDrawEntity;

  @Column('varchar', { length: 50, name: 'bet_type_id' })
  betTypeId!: string;

  @ManyToOne(() => BetTypeEntity)
  @JoinColumn({ name: 'bet_type_id' })
  betType?: BetTypeEntity;

  @Column('varchar', { length: 20, name: 'number_combination' })
  @Index()
  numberCombination!: string;

  @Column('decimal', { precision: 15, scale: 2, name: 'max_amount' })
  maxAmount!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.00, name: 'current_amount' })
  currentAmount!: number;

  @Column('date', { name: 'draw_date' })
  @Index()
  drawDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
