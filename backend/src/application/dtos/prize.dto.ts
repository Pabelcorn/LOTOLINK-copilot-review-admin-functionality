import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class BankAccountDto {
  @IsString()
  bank!: string;

  @IsString()
  account!: string;

  @IsString()
  holder!: string;
}

export class ClaimPrizeRequestDto {
  @IsEnum(['bank_transfer', 'cash', 'wallet'])
  paymentMethod!: 'bank_transfer' | 'cash' | 'wallet';

  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;
}

export class VerifyPrizeRequestDto {
  @IsString()
  adminId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePrizeRequestDto {
  @IsString()
  adminId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectPrizeRequestDto {
  @IsString()
  adminId!: string;

  @IsString()
  reason!: string;
}

export class PrizePaymentDto {
  @IsString()
  adminId!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;
}

export class PrizeDetailsDto {
  id!: string;
  playId!: string;
  userId!: string;
  bancaId!: string;
  lotteryId!: string;
  lotteryDrawId?: string;
  drawDate!: Date;
  betTypeId!: string;
  winningNumbers!: string[];
  matchedNumbers!: string[];
  betAmount!: number;
  prizeMultiplier!: number;
  prizeAmount!: number;
  status!: string;
  claimedAt?: Date;
  paymentMethod?: string;
  bankAccount?: BankAccountDto;
  paidAt?: Date;
  paidBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PrizeListDto {
  prizes!: PrizeDetailsDto[];
  total!: number;
  limit!: number;
  offset!: number;
}
