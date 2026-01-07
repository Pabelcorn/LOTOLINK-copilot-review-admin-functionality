import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCodeEntity } from '../../infrastructure/database/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly otpRepository: Repository<OtpCodeEntity>,
  ) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP code to phone
   * In production, this would integrate with an SMS gateway like Twilio
   */
  async sendOtp(phone: string, purpose: string): Promise<{ success: boolean; expiresIn: number }> {
    // Invalidate any existing non-verified OTP for this phone
    await this.otpRepository.update(
      {
        phone,
        purpose,
        verified: false,
      },
      {
        verified: true, // Mark as used to prevent reuse
      }
    );

    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

    const otpEntity = this.otpRepository.create({
      id: uuidv4(),
      phone,
      code,
      purpose,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      expiresAt,
    });

    await this.otpRepository.save(otpEntity);

    // TODO: In production, send SMS via SMS gateway
    // For development, log the OTP
    console.log(`[DEV] OTP for ${phone}: ${code}`);

    return {
      success: true,
      expiresIn: 300, // 5 minutes in seconds
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(phone: string, code: string, purpose: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        purpose,
        verified: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp) {
      return false;
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      return false;
    }

    // Check max attempts
    if (otp.attempts >= otp.maxAttempts) {
      return false;
    }

    // Increment attempts
    otp.attempts += 1;
    await this.otpRepository.save(otp);

    // Verify code
    if (otp.code !== code) {
      return false;
    }

    // Mark as verified
    otp.verified = true;
    otp.verifiedAt = new Date();
    await this.otpRepository.save(otp);

    return true;
  }

  /**
   * Check if phone has a verified OTP for the purpose
   */
  async hasVerifiedOtp(phone: string, purpose: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        purpose,
        verified: true,
      },
      order: {
        verifiedAt: 'DESC',
      },
    });

    if (!otp || !otp.verifiedAt) {
      return false;
    }

    // OTP verification is valid for 10 minutes after verification
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    return otp.verifiedAt > tenMinutesAgo;
  }

  /**
   * Cleanup expired OTPs (should be run periodically)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :oneDayAgo', { oneDayAgo })
      .execute();

    return result.affected || 0;
  }
}
