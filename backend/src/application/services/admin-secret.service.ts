import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminSecretCodeEntity, AdminAccessLogEntity } from '../../infrastructure/database/entities';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export interface AdminAccessAttempt {
  secretCode: string;
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminAccessResult {
  success: boolean;
  accessLevel?: string;
  userId?: string;
  errorMessage?: string;
}

@Injectable()
export class AdminSecretService {
  constructor(
    @InjectRepository(AdminSecretCodeEntity)
    private readonly adminSecretCodeRepository: Repository<AdminSecretCodeEntity>,
    @InjectRepository(AdminAccessLogEntity)
    private readonly adminAccessLogRepository: Repository<AdminAccessLogEntity>,
  ) {}

  /**
   * Validate admin secret code
   */
  async validateSecretCode(code: string): Promise<{
    valid: boolean;
    accessLevel?: string;
  }> {
    const secretCode = await this.adminSecretCodeRepository.findOne({
      where: {
        code,
        active: true,
      },
    });

    if (!secretCode) {
      return { valid: false };
    }

    return {
      valid: true,
      accessLevel: secretCode.accessLevel,
    };
  }

  /**
   * Check rate limit for admin access attempts
   */
  async checkRateLimit(ipAddress: string, secretCode: string): Promise<boolean> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentAttempts = await this.adminAccessLogRepository.count({
      where: {
        ipAddress,
        secretCode,
      },
    });

    const secret = await this.adminSecretCodeRepository.findOne({
      where: { code: secretCode },
    });

    const rateLimit = secret?.rateLimit || 3;
    return recentAttempts < rateLimit;
  }

  /**
   * Log admin access attempt
   */
  async logAccessAttempt(
    attempt: AdminAccessAttempt,
    result: AdminAccessResult,
  ): Promise<void> {
    const log = this.adminAccessLogRepository.create({
      id: uuidv4(),
      secretCode: attempt.secretCode,
      username: attempt.username,
      userId: result.userId,
      success: result.success,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      errorMessage: result.errorMessage,
    });

    await this.adminAccessLogRepository.save(log);
  }

  /**
   * Verify admin credentials after secret code is validated
   * This is a simplified version - in production, integrate with proper admin user system
   */
  async verifyAdminCredentials(
    username: string,
    password: string,
  ): Promise<{ valid: boolean; userId?: string; role?: string }> {
    // TODO: In production, this should check against actual admin users in the database
    // For now, using hardcoded admin credentials for demonstration
    const validAdmins = [
      { username: 'admin', password: 'admin123', userId: 'admin-1', role: 'admin' },
      { username: 'superadmin', password: 'super123', userId: 'admin-2', role: 'super_admin' },
    ];

    const admin = validAdmins.find(a => a.username === username && a.password === password);

    if (!admin) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: admin.userId,
      role: admin.role,
    };
  }

  /**
   * Complete admin access flow
   */
  async processAdminAccess(attempt: AdminAccessAttempt): Promise<AdminAccessResult> {
    // Check rate limit
    if (attempt.ipAddress) {
      const withinLimit = await this.checkRateLimit(attempt.ipAddress, attempt.secretCode);
      if (!withinLimit) {
        const result: AdminAccessResult = {
          success: false,
          errorMessage: 'Rate limit exceeded. Please try again later.',
        };
        await this.logAccessAttempt(attempt, result);
        throw new UnauthorizedException(result.errorMessage);
      }
    }

    // Validate secret code
    const codeValidation = await this.validateSecretCode(attempt.secretCode);
    if (!codeValidation.valid) {
      const result: AdminAccessResult = {
        success: false,
        errorMessage: 'Invalid secret code',
      };
      await this.logAccessAttempt(attempt, result);
      return result;
    }

    // Verify admin credentials
    const credentialsValidation = await this.verifyAdminCredentials(
      attempt.username,
      attempt.password,
    );

    if (!credentialsValidation.valid) {
      const result: AdminAccessResult = {
        success: false,
        errorMessage: 'Invalid admin credentials',
      };
      await this.logAccessAttempt(attempt, result);
      return result;
    }

    // Success
    const result: AdminAccessResult = {
      success: true,
      accessLevel: codeValidation.accessLevel,
      userId: credentialsValidation.userId,
    };

    await this.logAccessAttempt(attempt, result);
    return result;
  }

  /**
   * Get recent admin access logs
   */
  async getRecentAccessLogs(limit: number = 50): Promise<AdminAccessLogEntity[]> {
    return await this.adminAccessLogRepository.find({
      order: {
        accessedAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get failed access attempts for security monitoring
   */
  async getFailedAttempts(
    hours: number = 24,
    limit: number = 100,
  ): Promise<AdminAccessLogEntity[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return await this.adminAccessLogRepository.find({
      where: {
        success: false,
      },
      order: {
        accessedAt: 'DESC',
      },
      take: limit,
    });
  }
}
