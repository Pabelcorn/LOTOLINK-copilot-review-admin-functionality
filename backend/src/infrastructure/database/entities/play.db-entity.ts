import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { LotteryDrawEntity } from './lottery-draw.db-entity';

@Entity('plays')
export class PlayEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'request_id', unique: true })
  @Index()
  requestId!: string;

  @Column('varchar', { name: 'user_id' })
  @Index()
  userId!: string;

  @Column('varchar', { name: 'lottery_id' })
  lotteryId!: string;

  @Column('simple-array')
  numbers!: string[];

  @Column('varchar', { name: 'bet_type' })
  betType!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('jsonb', { name: 'payment_data' })
  paymentData!: {
    method: string;
    walletTransactionId?: string;
    cardLast4?: string;
  };

  @Column('varchar', { default: 'pending' })
  @Index()
  status!: string;

  @Column('varchar', { name: 'play_id_banca', nullable: true })
  playIdBanca?: string;

  @Column('varchar', { name: 'ticket_code', nullable: true })
  ticketCode?: string;

  @Column('varchar', { name: 'banca_id', nullable: true })
  @Index()
  bancaId?: string;

  @Column('uuid', { nullable: true, name: 'lottery_draw_id' })
  @Index()
  lotteryDrawId?: string;

  @ManyToOne(() => LotteryDrawEntity)
  @JoinColumn({ name: 'lottery_draw_id' })
  lotteryDraw?: LotteryDrawEntity;

  @Column('varchar', { length: 50, nullable: true, name: 'bet_type_id' })
  @Index()
  betTypeId?: string;

  @Column('date', { nullable: true, name: 'draw_date' })
  @Index()
  drawDate?: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'prize_multiplier' })
  prizeMultiplier?: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true, name: 'potential_prize' })
  potentialPrize?: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true, name: 'actual_prize' })
  actualPrize?: number;

  @Column('boolean', { default: false, name: 'is_winner' })
  @Index()
  isWinner!: boolean;

  @Column('uuid', { nullable: true, name: 'sucursal_id' })
  @Index()
  sucursalId?: string;

  @Column('varchar', { length: 50, nullable: true, name: 'sorteo_number' })
  @Index()
  sorteoNumber?: string;

  @Column('time', { nullable: true, name: 'sorteo_time' })
  sorteoTime?: string;

  @Column('varchar', { length: 100, nullable: true, name: 'sorteo_name' })
  @Index()
  sorteoName?: string;

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  barcode?: string;

  @Column('date', { nullable: true, name: 'valid_until' })
  @Index()
  validUntil?: Date;

  @Column('varchar', { length: 50, nullable: true, name: 'operator_user_id' })
  @Index()
  operatorUserId?: string;

  @Column('varchar', { length: 20, nullable: true })
  modality?: string;

  @Column('timestamp with time zone', { nullable: true, name: 'receipt_printed_at' })
  receiptPrintedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
