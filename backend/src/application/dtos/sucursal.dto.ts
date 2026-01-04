import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsObject, MaxLength } from 'class-validator';

// TicketConfig DTO
export class TicketConfigDto {
  @IsOptional()
  @IsString()
  headerLogo?: string;

  @IsOptional()
  @IsString()
  headerText?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsBoolean()
  showBarcode!: boolean;

  @IsBoolean()
  showQR!: boolean;

  @IsNumber()
  validityDays!: number;

  @IsOptional()
  @IsNumber()
  paperWidth?: number;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, string>;
}

// Create Sucursal DTO
export class CreateSucursalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  operatorPrefix?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  ticketConfig?: TicketConfigDto;
}

// Update Sucursal DTO
export class UpdateSucursalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  operatorPrefix?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Update Ticket Config DTO
export class UpdateTicketConfigDto {
  @IsOptional()
  @IsString()
  headerLogo?: string;

  @IsOptional()
  @IsString()
  headerText?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsBoolean()
  showBarcode?: boolean;

  @IsOptional()
  @IsBoolean()
  showQR?: boolean;

  @IsOptional()
  @IsNumber()
  validityDays?: number;

  @IsOptional()
  @IsNumber()
  paperWidth?: number;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, string>;
}

// Response DTO
export class SucursalResponseDto {
  id!: string;
  bancaId!: string;
  name!: string;
  code!: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  operatorPrefix?: string;
  isActive!: boolean;
  ticketConfig!: TicketConfigDto;
  createdAt!: Date;
  updatedAt!: Date;
}
