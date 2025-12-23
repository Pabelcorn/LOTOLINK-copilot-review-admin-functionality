import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  // Email Settings
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsString()
  emailHost?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  emailPort?: number;

  @IsOptional()
  @IsBoolean()
  emailSecure?: boolean;

  @IsOptional()
  @IsString()
  emailUser?: string;

  @IsOptional()
  @IsString()
  emailPassword?: string;

  @IsOptional()
  @IsEmail()
  emailFrom?: string;

  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  // Commission Settings
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage?: number;

  @IsOptional()
  @IsString()
  commissionStripeAccountId?: string;

  @IsOptional()
  @IsString()
  cardProcessingAccountId?: string;
}

export class SettingsResponseDto {
  emailEnabled: boolean;
  emailHost: string;
  emailPort: number;
  emailSecure: boolean;
  emailUser: string;
  emailPassword: string; // Always masked
  emailFrom: string;
  adminEmail: string;
  commissionPercentage: number;
  commissionStripeAccountId: string;
  cardProcessingAccountId: string;
}
