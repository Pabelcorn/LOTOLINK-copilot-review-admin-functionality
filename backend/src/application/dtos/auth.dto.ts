import { IsString, IsOptional, IsEmail, MinLength, IsDateString, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}

export class LoginDto {
  @IsString()
  phone!: string;

  @IsString()
  password!: string;
}

export class SendOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  purpose!: string; // 'registration' | 'login' | 'verification'
}

export class VerifyOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  code!: string;

  @IsString()
  purpose!: string;
}

export class VerifyAgeDto {
  @IsDateString()
  birthDate!: string;

  @IsBoolean()
  acceptTerms!: boolean;

  @IsBoolean()
  acceptPrivacy!: boolean;
}

export class AdminSecretDto {
  @IsString()
  secretCode!: string;

  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class GuestSessionDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  deviceInfo?: Record<string, unknown>;
}

export class AuthResponseDto {
  user!: {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    role: string;
    isAdmin: boolean;
    isGuest?: boolean;
    ageVerified?: boolean;
  };
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
}
