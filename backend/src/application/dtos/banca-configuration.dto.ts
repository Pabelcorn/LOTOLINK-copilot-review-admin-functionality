import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsDateString, Min } from 'class-validator';

// ============ ENABLE LOTTERY FOR BANCA ============
export class EnableLotteryForBancaDto {
  @IsString()
  lotteryId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionOverride?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perBetMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perNumberLimit?: number;
}

// ============ CREATE BET CONFIGURATION ============
export class CreateBetConfigurationDto {
  @IsString()
  lotteryId!: string;

  @IsString()
  betTypeId!: string;

  @IsNumber()
  @Min(0.01)
  minBetAmount!: number;

  @IsNumber()
  @Min(0.01)
  maxBetAmount!: number;

  @IsNumber()
  @Min(0.01)
  betIncrement!: number;

  @IsNumber()
  @Min(0.01)
  prizeMultiplier!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrizeAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionPercentage?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

// ============ BULK CREATE ============
export class BetConfigItemDto {
  @IsString()
  betTypeId!: string;

  @IsNumber()
  minBetAmount!: number;

  @IsNumber()
  maxBetAmount!: number;

  @IsNumber()
  betIncrement!: number;

  @IsNumber()
  prizeMultiplier!: number;

  @IsOptional()
  @IsNumber()
  maxPrizeAmount?: number;

  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;
}

export class BulkBetConfigurationDto {
  @IsString()
  lotteryId!: string;

  @IsArray()
  configurations!: BetConfigItemDto[];

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

// ============ UPDATE BET CONFIGURATION ============
export class UpdateBetConfigurationDto {
  @IsOptional()
  @IsNumber()
  minBetAmount?: number;

  @IsOptional()
  @IsNumber()
  maxBetAmount?: number;

  @IsOptional()
  @IsNumber()
  betIncrement?: number;

  @IsOptional()
  @IsNumber()
  prizeMultiplier?: number;

  @IsOptional()
  @IsNumber()
  maxPrizeAmount?: number;

  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

// ============ RESPONSE DTOS ============
export class BetConfigurationResponseDto {
  id!: string;
  bancaId!: string;
  lotteryId!: string;
  lotteryName!: string;
  betTypeId!: string;
  betTypeName!: string;
  minBetAmount!: number;
  maxBetAmount!: number;
  betIncrement!: number;
  prizeMultiplier!: number;
  maxPrizeAmount?: number;
  commissionPercentage?: number;
  isEnabled!: boolean;
  validFrom!: Date;
  validUntil?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class BancaLotteryResponseDto {
  id!: string;
  lotteryId!: string;
  lotteryName!: string;
  shortName?: string;
  isEnabled!: boolean;
  commissionOverride?: number;
  dailyLimit?: number;
  perBetMax?: number;
  perNumberLimit?: number;
  availableBetTypes!: {
    id: string;
    name: string;
    numbersRequired: number;
    defaultPrizeMultiplier: number;
  }[];
  enabledDraws!: DrawSummaryDto[];
}

export class DrawSummaryDto {
  id!: string;
  name!: string;
  code!: string;
  drawTime!: string;
  daysOfWeek!: number[];
  closeBeforeMinutes!: number;
  isEnabled!: boolean;
  customCloseBeforeMinutes?: number;
  nextDrawTime?: Date;
  isCurrentlyOpen!: boolean;
}

// ============ FULL CONFIGURATION (for mobile app) ============
export class BancaFullConfigurationDto {
  bancaId!: string;
  bancaName!: string;
  ownerId?: string;
  ownerName?: string;
  
  lotteries!: {
    id: string;
    name: string;
    shortName?: string;
    country: string;
    numberRangeMin: number;
    numberRangeMax: number;
    draws: DrawSummaryDto[];
    betTypes: {
      id: string;
      name: string;
      description?: string;
      numbersRequired: number;
      numbersOrdered: boolean;
      minBetAmount: number;
      maxBetAmount: number;
      betIncrement: number;
      prizeMultiplier: number;
      maxPrizeAmount?: number;
    }[];
  }[];

  generalLimits?: {
    dailyLimit?: number;
    perBetMax?: number;
    perNumberLimit?: number;
  };

  paymentMethods!: {
    acceptsCash: boolean;
    acceptsCard: boolean;
    acceptsTransfer: boolean;
  };

  operatingHours?: Record<string, any>;
  timezone!: string;
}

// ============ BLOCK NUMBER ============
export class BlockNumberDto {
  @IsString()
  blockedNumber!: string;

  @IsOptional()
  @IsString()
  lotteryId?: string;

  @IsOptional()
  @IsString()
  lotteryDrawId?: string;

  @IsOptional()
  @IsString()
  betTypeId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  blockedUntil?: string;
}

// ============ NUMBER LIMIT ============
export class NumberLimitDto {
  @IsString()
  numberCombination!: string;

  @IsString()
  lotteryId!: string;

  @IsOptional()
  @IsString()
  lotteryDrawId?: string;

  @IsString()
  betTypeId!: string;

  @IsNumber()
  @Min(0)
  maxAmount!: number;

  @IsDateString()
  drawDate!: string;
}
