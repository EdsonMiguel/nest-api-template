import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly configService: ConfigService) {}

  generateToken(): string {
    return randomBytes(64).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getExpiresAt(): Date {
    const expiresIn = this.configService.getOrThrow<string>(
      'auth.jwt.refreshExpiresIn',
    );
    const durationMs = this.parseDuration(expiresIn);

    return new Date(Date.now() + durationMs);
  }

  private parseDuration(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);

    if (!match) {
      throw new Error(
        'Invalid JWT_REFRESH_EXPIRES_IN. Use formats like 15m, 12h, or 7d.',
      );
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }
}
