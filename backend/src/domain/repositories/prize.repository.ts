import { Prize } from '../entities/prize.entity';
import { PrizeStatus } from '../entities/prize.entity';

export const PRIZE_REPOSITORY = 'PRIZE_REPOSITORY';

export interface PrizeRepository {
  save(prize: Prize): Promise<Prize>;
  update(prize: Prize): Promise<Prize>;
  findById(id: string): Promise<Prize | null>;
  findByPlayId(playId: string): Promise<Prize | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Prize[]>;
  findByStatus(status: PrizeStatus, limit?: number, offset?: number): Promise<Prize[]>;
  findPendingPrizes(limit?: number, offset?: number): Promise<Prize[]>;
  findByBancaId(bancaId: string, limit?: number, offset?: number): Promise<Prize[]>;
  countByStatus(status: PrizeStatus): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}
