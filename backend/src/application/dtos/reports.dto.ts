import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum PrizeStatusDto {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
  REJECTED = 'rejected',
}

// ============ DAILY SALES DTO ============
export class BancaDailySalesDto {
  bancaId!: string;
  bancaName!: string;
  date!: Date;
  totalBets!: number;
  totalAmount!: number;
  totalPrizesPaid!: number;
  totalCommission!: number;
  netResult!: number;
  breakdownByBetType!: Record<string, any>;
  breakdownByLottery!: Record<string, any>;
}

// ============ OWNER CONSOLIDATED SALES DTO ============
export class OwnerConsolidatedSalesDto {
  ownerId!: string;
  ownerName!: string;
  startDate!: Date;
  endDate!: Date;
  totalBranches!: number;
  
  totals!: {
    totalBets: number;
    totalAmount: number;
    totalPrizesPaid: number;
    totalCommission: number;
    netResult: number;
  };

  byBanca!: {
    bancaId: string;
    bancaName: string;
    totalBets: number;
    totalAmount: number;
    totalPrizesPaid: number;
    totalCommission: number;
    netResult: number;
  }[];

  byLottery!: Record<string, {
    totalBets: number;
    totalAmount: number;
  }>;

  byBetType!: Record<string, {
    totalBets: number;
    totalAmount: number;
  }>;
}

// ============ PRIZE DTO ============
export class PrizeResponseDto {
  id!: string;
  playId!: string;
  bancaId!: string;
  bancaName!: string;
  userId!: string;
  userName!: string;
  lotteryId!: string;
  lotteryName!: string;
  lotteryDrawId?: string;
  drawName?: string;
  drawDate!: Date;
  betTypeId!: string;
  betTypeName!: string;
  winningNumbers!: string[];
  matchedNumbers!: string[];
  betAmount!: number;
  prizeMultiplier!: number;
  prizeAmount!: number;
  status!: PrizeStatusDto;
  paidAt?: Date;
  paidBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

// ============ UPDATE PRIZE DTO ============
export class UpdatePrizeDto {
  @IsOptional()
  @IsEnum(PrizeStatusDto)
  status?: PrizeStatusDto;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

export class ApprovePrizeDto {
  @IsString()
  verifiedBy!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectPrizeDto {
  @IsString()
  verifiedBy!: string;

  @IsString()
  reason!: string;
}

export class MarkPrizePaidDto {
  @IsString()
  paidBy!: string;
}

// ============ QUERY FILTERS ============
export class SalesReportFilterDto {
  @IsOptional()
  @IsString()
  bancaId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  lotteryId?: string;

  @IsOptional()
  @IsString()
  betTypeId?: string;
}

export class PrizeFilterDto {
  @IsOptional()
  @IsString()
  bancaId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(PrizeStatusDto)
  status?: PrizeStatusDto;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  lotteryId?: string;
}
