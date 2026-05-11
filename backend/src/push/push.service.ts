import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicePlatform } from '@prisma/client';

@Injectable()
export class PushService {
  private logger = new Logger(PushService.name);

  constructor(private prisma: PrismaService) {}

  /** Register or refresh a device token for the given user. */
  async register(userId: string, platform: DevicePlatform, token: string, appVersion?: string) {
    return this.prisma.deviceToken.upsert({
      where: { userId_token: { userId, token } },
      update: { platform, appVersion, lastSeen: new Date(), revokedAt: null },
      create: { userId, platform, token, appVersion },
    });
  }

  /** Mark a token as revoked (called on logout or APNs/FCM error). */
  async revoke(userId: string, token: string) {
    return this.prisma.deviceToken.updateMany({
      where: { userId, token },
      data: { revokedAt: new Date() },
    });
  }

  /** Lookup tokens for a user (used by sender — actual delivery is a TODO). */
  async tokensFor(userId: string) {
    return this.prisma.deviceToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastSeen: 'desc' },
    });
  }

  /**
   * Deliver a push to a user. Today this is a stub that logs; wire up
   * APNs/FCM (e.g. via firebase-admin or a queue) in a follow-up.
   */
  async sendToUser(userId: string, payload: { title: string; body: string; data?: Record<string, any> }) {
    const tokens = await this.tokensFor(userId);
    if (tokens.length === 0) return { sent: 0 };
    this.logger.log(
      `[push] would send to ${tokens.length} device(s) for user=${userId}: ${payload.title}`,
    );
    // TODO: integrate firebase-admin or APNs HTTP/2 here.
    return { sent: tokens.length, simulated: true };
  }
}
