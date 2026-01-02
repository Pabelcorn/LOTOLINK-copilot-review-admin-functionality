import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';

@Entity('banca_daily_sales')
export class BancaDailySalesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @ManyToOne(() => BancaEntity)
  @JoinColumn({ name: 'banca_id' })
  banca?: BancaEntity;

  @Column('date')
  @Index()
  date!: Date;

  @Column('integer', { default: 0, name: 'total_bets' })
  totalBets!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.00, name: 'total_amount' })
  totalAmount!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.00, name: 'total_prizes_paid' })
  totalPrizesPaid!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.00, name: 'total_commission' })
  totalCommission!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0.00, name: 'net_result' })
  netResult!: number;

  @Column('jsonb', { default: {}, name: 'breakdown_by_bet_type' })
  breakdownByBetType!: Record<string, any>;

  @Column('jsonb', { default: {}, name: 'breakdown_by_lottery' })
  breakdownByLottery!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
