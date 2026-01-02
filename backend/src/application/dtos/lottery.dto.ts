import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';

// ============ LOTTERY DTO ============
export class LotteryResponseDto {
  id!: string;
  name!: string;
  shortName?: string;
  country!: string;
  logoUrl?: string;
  websiteUrl?: string;
  numberRangeMin!: number;
  numberRangeMax!: number;
  status!: string;
  displayOrder!: number;
  draws!: LotteryDrawResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

// ============ LOTTERY DRAW DTO ============
export class LotteryDrawResponseDto {
  id!: string;
  lotteryId!: string;
  name!: string;
  code!: string;
  drawTime!: string;
  daysOfWeek!: number[];
  closeBeforeMinutes!: number;
  status!: string;
  displayOrder!: number;
  nextDrawTime?: Date;
  isCurrentlyOpen!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

// ============ BET TYPE DTO ============
export class BetTypeResponseDto {
  id!: string;
  name!: string;
  description?: string;
  numbersRequired!: number;
  numbersOrdered!: boolean;
  defaultPrizeMultiplier!: number;
  status!: string;
  displayOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

// ============ CREATE/UPDATE LOTTERY ============
export class CreateLotteryDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsNumber()
  @Min(0)
  numberRangeMin!: number;

  @IsNumber()
  @Min(0)
  numberRangeMax!: number;
}

export class UpdateLotteryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsNumber()
  numberRangeMin?: number;

  @IsOptional()
  @IsNumber()
  numberRangeMax?: number;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

// ============ CREATE/UPDATE DRAW ============
export class CreateLotteryDrawDto {
  @IsString()
  lotteryId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  drawTime!: string;

  @IsArray()
  daysOfWeek!: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  closeBeforeMinutes?: number;
}

export class UpdateLotteryDrawDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  drawTime?: string;

  @IsOptional()
  @IsArray()
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  closeBeforeMinutes?: number;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

// ============ CREATE/UPDATE BET TYPE ============
export class CreateBetTypeDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  numbersRequired!: number;

  @IsBoolean()
  numbersOrdered!: boolean;

  @IsNumber()
  @Min(0.01)
  defaultPrizeMultiplier!: number;
}

export class UpdateBetTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  defaultPrizeMultiplier?: number;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
