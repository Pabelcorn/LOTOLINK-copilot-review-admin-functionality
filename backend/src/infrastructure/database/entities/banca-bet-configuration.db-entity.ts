import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';
import { LotteryEntity } from './lottery.db-entity';
import { BetTypeEntity } from './bet-type.db-entity';

@Entity('banca_bet_configurations')
export class BancaBetConfigurationEntity {
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

  @Column('varchar', { length: 50, name: 'bet_type_id' })
  @Index()
  betTypeId!: string;

  @ManyToOne(() => BetTypeEntity)
  @JoinColumn({ name: 'bet_type_id' })
  betType?: BetTypeEntity;

  @Column('decimal', { precision: 10, scale: 2, default: 5.00, name: 'min_bet_amount' })
  minBetAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 10000.00, name: 'max_bet_amount' })
  maxBetAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 5.00, name: 'bet_increment' })
  betIncrement!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'prize_multiplier' })
  prizeMultiplier!: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true, name: 'max_prize_amount' })
  maxPrizeAmount?: number;

  @Column('decimal', { precision: 5, scale: 4, nullable: true, name: 'commission_percentage' })
  commissionPercentage?: number;

  @Column('boolean', { default: true, name: 'is_enabled' })
  @Index()
  isEnabled!: boolean;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP', name: 'valid_from' })
  @Index()
  validFrom!: Date;

  @Column('timestamp with time zone', { nullable: true, name: 'valid_until' })
  @Index()
  validUntil?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
