import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../../../application/services/user.service';
import { OtpService } from '../../../application/services/otp.service';
import { GuestService } from '../../../application/services/guest.service';
import { AdminSecretService } from '../../../application/services/admin-secret.service';
import { PasswordService } from '../../security/password.service';
import { 
  RegisterDto, 
  LoginDto, 
  AuthResponseDto,
  SendOtpDto,
  VerifyOtpDto,
  VerifyAgeDto,
  AdminSecretDto,
  GuestSessionDto,
  GoogleAuthDto,
  AppleAuthDto,
} from '../../../application/dtos/auth.dto';
import { UserRole } from '../../../domain/entities/user.entity';
import { SocialAuthService } from '../../../application/services/social-auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly otpService: OtpService,
    private readonly guestService: GuestService,
    private readonly adminSecretService: AdminSecretService,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Hash the password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // All new users are created with USER role
    // Admins must be created through a separate protected endpoint
    const role = UserRole.USER;

    const user = await this.userService.createUser({
      phone: registerDto.phone,
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role,
    });

    const payload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by phone
    const user = await this.userService.getUserByPhone(loginDto.phone);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        phone: payload.phone,
        email: payload.email,
        role: payload.role,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{ success: boolean; expiresIn: number }> {
    return await this.otpService.sendOtp(sendOtpDto.phone, sendOtpDto.purpose);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean }> {
    const success = await this.otpService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.code,
      verifyOtpDto.purpose,
    );

    if (!success) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    return { success };
  }

  @Post('verify-age')
  @HttpCode(HttpStatus.OK)
  async verifyAge(
    @Body() verifyAgeDto: VerifyAgeDto,
  ): Promise<{ success: boolean; ageVerified: boolean }> {
    if (!verifyAgeDto.acceptTerms || !verifyAgeDto.acceptPrivacy) {
      throw new BadRequestException('You must accept terms and privacy policy');
    }

    const user = await this.userService.getUserById(verifyAgeDto.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const birthDate = new Date(verifyAgeDto.birthDate);
    const ageVerified = user.verifyAge(birthDate);

    if (!ageVerified) {
      throw new BadRequestException('You must be 18 years or older to use this platform');
    }

    await this.userService.updateUser(verifyAgeDto.userId, {
      birthDate,
      ageVerified: true,
    });

    return { success: true, ageVerified: true };
  }

  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  async createGuestSession(@Body() guestSessionDto: GuestSessionDto): Promise<{
    sessionToken: string;
    accessToken: string;
    expiresIn: number;
  }> {
    return await this.guestService.createGuestSession(
      guestSessionDto.deviceId,
      guestSessionDto.deviceInfo,
    );
  }

  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  @Post('admin-secret')
  @HttpCode(HttpStatus.OK)
  async validateAdminSecret(
    @Body() adminSecretDto: AdminSecretDto,
    @Req() request: Request,
  ): Promise<{ success: boolean; accessToken?: string; accessLevel?: string }> {
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await this.adminSecretService.processAdminAccess({
      secretCode: adminSecretDto.secretCode,
      username: adminSecretDto.username,
      password: adminSecretDto.password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      throw new UnauthorizedException(result.errorMessage || 'Invalid credentials');
    }

    // Generate admin JWT token
    const accessToken = this.jwtService.sign({
      sub: result.userId,
      role: 'admin',
      accessLevel: result.accessLevel,
      isAdmin: true,
    });

    return {
      success: true,
      accessToken,
      accessLevel: result.accessLevel,
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async authenticateWithGoogle(@Body() googleAuthDto: GoogleAuthDto): Promise<AuthResponseDto> {
    // Verify Google token
    const socialAuthResult = await this.socialAuthService.verifyGoogleToken(googleAuthDto.idToken);

    // Check if user already exists with this email or Google ID
    let user = await this.userService.getUserByEmail(socialAuthResult.email);

    if (!user) {
      // Create new user with Google account
      const placeholderPhone = this.socialAuthService.generatePlaceholderPhone(socialAuthResult.providerId);
      
      user = await this.userService.createUser({
        email: socialAuthResult.email,
        phone: placeholderPhone,
        name: socialAuthResult.name,
        role: UserRole.USER,
        emailVerified: socialAuthResult.emailVerified,
        provider: socialAuthResult.provider,
        providerId: socialAuthResult.providerId,
      });
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async authenticateWithApple(@Body() appleAuthDto: AppleAuthDto): Promise<AuthResponseDto> {
    // Verify Apple token
    const socialAuthResult = await this.socialAuthService.verifyAppleToken(appleAuthDto.identityToken);

    // Parse user info if provided (only on first sign-in)
    let userName: string | undefined;
    if (appleAuthDto.user) {
      try {
        const userInfo = JSON.parse(appleAuthDto.user);
        userName = userInfo.name ? `${userInfo.name.firstName || ''} ${userInfo.name.lastName || ''}`.trim() : undefined;
      } catch {
        // Ignore parse errors
      }
    }

    // Check if user already exists with this email or Apple ID
    let user = await this.userService.getUserByEmail(socialAuthResult.email);

    if (!user) {
      // Create new user with Apple account
      const placeholderPhone = this.socialAuthService.generatePlaceholderPhone(socialAuthResult.providerId);
      
      user = await this.userService.createUser({
        email: socialAuthResult.email,
        phone: placeholderPhone,
        name: userName || socialAuthResult.name,
        role: UserRole.USER,
        emailVerified: socialAuthResult.emailVerified,
        provider: socialAuthResult.provider,
        providerId: socialAuthResult.providerId,
      });
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }
}
