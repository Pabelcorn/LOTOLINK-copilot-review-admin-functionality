import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsObject, Length, Min, Max } from 'class-validator';

export enum BankAccountTypeDto {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

export enum BancaOwnerStatusDto {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

// ============ CREATE ============
export class CreateBancaOwnerDto {
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @IsString()
  @Length(1, 100)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  cedula?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  rnc?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  businessName?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsEnum(BankAccountTypeDto)
  bankAccountType?: BankAccountTypeDto;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  defaultCommissionPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============ UPDATE ============
export class UpdateBancaOwnerDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsOptional()
  @IsString()
  rnc?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsEnum(BankAccountTypeDto)
  bankAccountType?: BankAccountTypeDto;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  defaultCommissionPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============ RESPONSE ============
export class BancaOwnerResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  fullName!: string;
  email!: string;
  phone?: string;
  cedula?: string;
  rnc?: string;
  businessName?: string;
  bankName?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  stripeAccountId?: string;
  defaultCommissionPercentage!: number;
  status!: BancaOwnerStatusDto;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class BancaOwnerWithBranchesDto extends BancaOwnerResponseDto {
  branches!: {
    id: string;
    name: string;
    branchCode?: string;
    city?: string;
    isMainBranch?: boolean;
    status: string;
  }[];
  totalBranches!: number;
}
