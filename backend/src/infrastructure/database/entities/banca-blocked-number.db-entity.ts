import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BancaEntity } from './banca.db-entity';
import { LotteryEntity } from './lottery.db-entity';
import { LotteryDrawEntity } from './lottery-draw.db-entity';
import { BetTypeEntity } from './bet-type.db-entity';

@Entity('banca_blocked_numbers')
export class BancaBlockedNumberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'banca_id' })
  @Index()
  bancaId!: string;

  @ManyToOne(() => BancaEntity)
  @JoinColumn({ name: 'banca_id' })
  banca?: BancaEntity;

  @Column('varchar', { length: 50, nullable: true, name: 'lottery_id' })
  @Index()
  lotteryId?: string;

  @ManyToOne(() => LotteryEntity)
  @JoinColumn({ name: 'lottery_id' })
  lottery?: LotteryEntity;

  @Column('uuid', { nullable: true, name: 'lottery_draw_id' })
  @Index()
  lotteryDrawId?: string;

  @ManyToOne(() => LotteryDrawEntity)
  @JoinColumn({ name: 'lottery_draw_id' })
  lotteryDraw?: LotteryDrawEntity;

  @Column('varchar', { length: 50, nullable: true, name: 'bet_type_id' })
  betTypeId?: string;

  @ManyToOne(() => BetTypeEntity)
  @JoinColumn({ name: 'bet_type_id' })
  betType?: BetTypeEntity;

  @Column('varchar', { length: 20, name: 'blocked_number' })
  @Index()
  blockedNumber!: string;

  @Column('text', { nullable: true })
  reason?: string;

  @Column('timestamp with time zone', { nullable: true, name: 'blocked_until' })
  @Index()
  blockedUntil?: Date;

  @Column('uuid', { nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
