import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PlayEntity } from './play.db-entity';
import { BancaEntity } from './banca.db-entity';
import { UserEntity } from './user.db-entity';
import { LotteryEntity } from './lottery.db-entity';
import { LotteryDrawEntity } from './lottery-draw.db-entity';
import { BetTypeEntity } from './bet-type.db-entity';

@Entity('prizes')
export class PrizeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'play_id' })
  playId!: string;

  @ManyToOne(() => PlayEntity)
  @JoinColumn({ name: 'play_id' })
  play?: PlayEntity;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @ManyToOne(() => BancaEntity)
  @JoinColumn({ name: 'banca_id' })
  banca?: BancaEntity;

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column('varchar', { length: 50, name: 'lottery_id' })
  @Index()
  lotteryId!: string;

  @ManyToOne(() => LotteryEntity)
  @JoinColumn({ name: 'lottery_id' })
  lottery?: LotteryEntity;

  @Column('uuid', { nullable: true, name: 'lottery_draw_id' })
  lotteryDrawId?: string;

  @ManyToOne(() => LotteryDrawEntity)
  @JoinColumn({ name: 'lottery_draw_id' })
  lotteryDraw?: LotteryDrawEntity;

  @Column('date', { name: 'draw_date' })
  @Index()
  drawDate!: Date;

  @Column('varchar', { length: 50, name: 'bet_type_id' })
  betTypeId!: string;

  @ManyToOne(() => BetTypeEntity)
  @JoinColumn({ name: 'bet_type_id' })
  betType?: BetTypeEntity;

  @Column('text', { array: true, name: 'winning_numbers' })
  winningNumbers!: string[];

  @Column('text', { array: true, name: 'matched_numbers' })
  matchedNumbers!: string[];

  @Column('decimal', { precision: 10, scale: 2, name: 'bet_amount' })
  betAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'prize_multiplier' })
  prizeMultiplier!: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'prize_amount' })
  prizeAmount!: number;

  @Column('varchar', { length: 20, default: 'pending' })
  @Index()
  status!: string;

  @Column('timestamp with time zone', { nullable: true, name: 'paid_at' })
  paidAt?: Date;

  @Column('uuid', { nullable: true, name: 'paid_by' })
  paidBy?: string;

  @Column('timestamp with time zone', { nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @Column('uuid', { nullable: true, name: 'verified_by' })
  verifiedBy?: string;

  @Column('text', { nullable: true, name: 'verification_notes' })
  verificationNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
