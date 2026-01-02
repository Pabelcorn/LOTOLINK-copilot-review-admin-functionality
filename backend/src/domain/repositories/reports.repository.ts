import { Prize, PrizeStatus } from '../entities/prize.entity';

export interface ReportsFilter {
  bancaId?: string;
  ownerId?: string;
  startDate?: Date;
  endDate?: Date;
  lotteryId?: string;
  betTypeId?: string;
}

export interface DailySales {
  bancaId: string;
  date: Date;
  totalBets: number;
  totalAmount: number;
  totalPrizesPaid: number;
  totalCommission: number;
  netResult: number;
  breakdownByBetType: Record<string, any>;
  breakdownByLottery: Record<string, any>;
}

export interface ReportsRepository {
  // Daily Sales
  getDailySales(bancaId: string, date: Date): Promise<DailySales | null>;
  getDailySalesRange(bancaId: string, startDate: Date, endDate: Date): Promise<DailySales[]>;
  updateDailySales(sales: DailySales): Promise<void>;
  
  // Owner Reports
  getOwnerBancas(ownerId: string): Promise<string[]>;
  getOwnerConsolidatedSales(ownerId: string, startDate: Date, endDate: Date): Promise<any>;
  
  // Prizes
  findPrizeById(id: string): Promise<Prize | null>;
  findPrizes(filter: { bancaId?: string; userId?: string; status?: PrizeStatus; startDate?: Date; endDate?: Date }): Promise<Prize[]>;
  savePrize(prize: Prize): Promise<Prize>;
  updatePrize(prize: Prize): Promise<Prize>;
  getPendingPrizes(bancaId?: string): Promise<Prize[]>;
}

export const REPORTS_REPOSITORY = Symbol('ReportsRepository');
