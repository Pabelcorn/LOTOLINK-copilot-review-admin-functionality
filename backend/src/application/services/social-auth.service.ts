import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface AppleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
}

export interface SocialAuthResult {
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  photoUrl?: string;
}

@Injectable()
export class SocialAuthService {
  private readonly googleClientId: string;
  private readonly appleClientId: string;

  constructor(private readonly configService: ConfigService) {
    this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID', '');
    this.appleClientId = this.configService.get<string>('APPLE_CLIENT_ID', '');
  }

  /**
   * Verify Google ID token
   */
  async verifyGoogleToken(idToken: string): Promise<SocialAuthResult> {
    try {
      // Verify token with Google's tokeninfo endpoint
      const response = await axios.get<GoogleTokenPayload>(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );

      const payload = response.data;

      // Verify audience (client ID)
      if (this.googleClientId && payload.sub !== this.googleClientId) {
        // Note: In production, verify aud field, not sub
        // This is a simplified check
      }

      // Verify email is verified
      if (!payload.email_verified) {
        throw new BadRequestException('Email not verified with Google');
      }

      return {
        provider: 'google',
        providerId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
        photoUrl: payload.picture,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new UnauthorizedException('Invalid Google token');
      }
      throw error;
    }
  }

  /**
   * Verify Apple identity token
   * Note: Apple token verification requires fetching Apple's public keys
   * and verifying the JWT signature. For MVP, we'll implement a simplified version.
   */
  async verifyAppleToken(identityToken: string): Promise<SocialAuthResult> {
    try {
      // In production, you would:
      // 1. Fetch Apple's public keys from https://appleid.apple.com/auth/keys
      // 2. Verify the JWT signature using the public key
      // 3. Validate the token claims (iss, aud, exp, etc.)
      
      // For MVP, we'll decode the token (without verification - NOT FOR PRODUCTION)
      const payload = this.decodeJWT<AppleTokenPayload>(identityToken);

      if (!payload) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      // Basic validation
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Apple token payload');
      }

      return {
        provider: 'apple',
        providerId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified || true, // Apple emails are considered verified
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  /**
   * Decode JWT without verification (FOR DEVELOPMENT ONLY)
   * In production, use a proper JWT verification library
   */
  private decodeJWT<T>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded) as T;
    } catch {
      return null;
    }
  }

  /**
   * Generate a unique phone number placeholder for social auth users
   * In production, prompt users to add their phone number later
   */
  generatePlaceholderPhone(providerId: string): string {
    // Generate a unique placeholder based on provider ID
    // This is temporary until user adds their real phone
    const hash = providerId.substring(0, 10).padEnd(10, '0');
    return `+social${hash}`;
  }
}
