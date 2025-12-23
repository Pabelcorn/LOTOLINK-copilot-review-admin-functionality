import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../application/services/user.service';
import { PasswordService } from '../../security/password.service';
import { UserRole } from '../../../domain/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  name?: string;
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AdminLoginDto) {
    // For admin login, we use phone field as username
    const user = await this.userService.getUserByPhone(loginDto.username);
    
    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isValid = await this.passwordService.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '8h', // Admin sessions expire in 8 hours
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 28800, // 8 hours in seconds
    };
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req: any) {
    // Only existing admins can create new admins
    const requestingUser = await this.userService.getUserById(req.user.sub);
    
    if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only admins can create new admins');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(
      createAdminDto.password,
    );

    // Create admin user
    const admin = await this.userService.createUser({
      phone: createAdminDto.username, // Using phone field for username
      email: createAdminDto.email,
      name: createAdminDto.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    return {
      id: admin.id,
      phone: admin.phone,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Verify user is still an admin
      const user = await this.userService.getUserById(payload.sub);
      if (!user || user.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        phone: payload.phone,
        email: payload.email,
        role: payload.role,
      }, {
        expiresIn: '8h',
      });

      return { 
        accessToken: newAccessToken,
        expiresIn: 28800,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
