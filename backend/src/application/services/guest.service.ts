import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestSessionEntity } from '../../infrastructure/database/entities';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(GuestSessionEntity)
    private readonly guestSessionRepository: Repository<GuestSessionEntity>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create a guest session
   */
  async createGuestSession(deviceId?: string, deviceInfo?: Record<string, unknown>): Promise<{
    sessionToken: string;
    accessToken: string;
    expiresIn: number;
  }> {
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const guestSession = this.guestSessionRepository.create({
      id: uuidv4(),
      sessionToken,
      deviceId,
      deviceInfo,
      expiresAt,
    });

    await this.guestSessionRepository.save(guestSession);

    // Create JWT token for guest
    const accessToken = this.jwtService.sign({
      sub: guestSession.id,
      sessionToken,
      role: 'guest',
      isGuest: true,
    });

    return {
      sessionToken,
      accessToken,
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    };
  }

  /**
   * Get guest session by token
   */
  async getGuestSession(sessionToken: string): Promise<GuestSessionEntity | null> {
    const session = await this.guestSessionRepository.findOne({
      where: { sessionToken },
    });

    if (!session) {
      return null;
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      return null;
    }

    return session;
  }

  /**
   * Update guest session activity
   */
  async updateGuestActivity(sessionToken: string): Promise<void> {
    await this.guestSessionRepository.update(
      { sessionToken },
      { lastActivity: new Date() }
    );
  }

  /**
   * Convert guest session to full user account
   */
  async convertGuestToUser(sessionToken: string, userId: string): Promise<void> {
    await this.guestSessionRepository.update(
      { sessionToken },
      { convertedToUserId: userId }
    );
  }

  /**
   * Check if session is valid and not expired
   */
  async isValidGuestSession(sessionToken: string): Promise<boolean> {
    const session = await this.getGuestSession(sessionToken);
    return !!session;
  }

  /**
   * Cleanup expired guest sessions (should be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.guestSessionRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :sevenDaysAgo', { sevenDaysAgo })
      .execute();

    return result.affected || 0;
  }

  /**
   * Check if certain actions are restricted for guests
   */
  isActionRestricted(action: string): boolean {
    const restrictedActions = [
      'buy_ticket',
      'confirm_play',
      'add_funds',
      'view_history',
      'claim_prize',
      'save_play',
    ];

    return restrictedActions.includes(action);
  }
}
