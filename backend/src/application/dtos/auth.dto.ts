import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

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

export class AuthResponseDto {
  user!: {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    role: string;
    isAdmin: boolean;
  };
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
}
