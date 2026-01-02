import { Lottery } from '../entities/lottery.entity';
import { LotteryDraw } from '../entities/lottery-draw.entity';
import { BetType } from '../entities/bet-type.entity';

export interface LotteryRepository {
  // Lotteries
  findLotteryById(id: string): Promise<Lottery | null>;
  findAllLotteries(activeOnly?: boolean): Promise<Lottery[]>;
  findLotteriesByCountry(country: string): Promise<Lottery[]>;
  saveLottery(lottery: Lottery): Promise<Lottery>;
  
  // Lottery Draws
  findDrawById(id: string): Promise<LotteryDraw | null>;
  findDrawsByLotteryId(lotteryId: string, activeOnly?: boolean): Promise<LotteryDraw[]>;
  saveDraw(draw: LotteryDraw): Promise<LotteryDraw>;
  
  // Bet Types
  findBetTypeById(id: string): Promise<BetType | null>;
  findAllBetTypes(activeOnly?: boolean): Promise<BetType[]>;
  saveBetType(betType: BetType): Promise<BetType>;
}

export const LOTTERY_REPOSITORY = Symbol('LotteryRepository');
