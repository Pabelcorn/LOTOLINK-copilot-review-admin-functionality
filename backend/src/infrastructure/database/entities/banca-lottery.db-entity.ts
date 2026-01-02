import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';
import { LotteryEntity } from './lottery.db-entity';

@Entity('banca_lotteries')
export class BancaLotteryEntity {
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

  @Column('boolean', { default: true, name: 'is_enabled' })
  @Index()
  isEnabled!: boolean;

  @Column('decimal', { precision: 5, scale: 4, nullable: true, name: 'commission_override' })
  commissionOverride?: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true, name: 'daily_limit' })
  dailyLimit?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'per_bet_max' })
  perBetMax?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'per_number_limit' })
  perNumberLimit?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
