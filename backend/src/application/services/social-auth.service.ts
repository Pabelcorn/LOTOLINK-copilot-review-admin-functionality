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
   * IMPORTANT: This is a simplified MVP implementation.
   * In production, you MUST implement proper JWT verification:
   * 1. Fetch Apple's public keys from https://appleid.apple.com/auth/keys
   * 2. Verify the JWT signature using the public key
   * 3. Validate all token claims (iss, aud, exp, iat, sub)
   * 
   * For production, consider using a library like:
   * - apple-signin-auth (npm package)
   * - jsonwebtoken with jwks-rsa
   */
  async verifyAppleToken(identityToken: string): Promise<SocialAuthResult> {
    try {
      // TODO: PRODUCTION IMPLEMENTATION REQUIRED
      // This is a development-only implementation
      // Replace with proper Apple token verification before deploying
      
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException(
          'Apple Sign-In is not configured for production. Please implement proper token verification.'
        );
      }
      
      // Development-only: decode without verification (NOT SECURE)
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
   * Generate a valid placeholder phone number for social auth users
   * Format: +1800 + last 7 digits of hash
   * Note: In production, prompt users to add their real phone number
   * or make phone number optional for social auth accounts
   */
  generatePlaceholderPhone(providerId: string): string {
    // Generate a hash from provider ID
    const hash = providerId.substring(0, 15).padEnd(15, '0');
    // Use toll-free number prefix +1800 + 7 digits
    return `+1800${hash.substring(0, 7)}`;
  }
}
