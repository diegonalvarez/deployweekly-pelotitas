import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, ActivateProfileDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.phone) {
      const phoneExists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (phoneExists) throw new ConflictException('Phone already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Register as global user — no roles yet until profile activation
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roles: [], // Empty — user activates profiles later
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        identityStatus: true,
        phoneVerified: true,
      },
    });

    // If referral code provided, track it
    if (dto.referralCode) {
      const referrer = await this.prisma.organizerProfile.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (referrer) {
        await this.prisma.organizerProfile.update({
          where: { id: referrer.id },
          data: { referralCount: { increment: 1 } },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // Automatically send verification email after registration
    await this.sendVerificationEmail(user.id);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        identityStatus: user.identityStatus,
        phoneVerified: user.phoneVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        roles: true,
        identityStatus: true,
        phoneVerified: true,
        emailVerified: true,
        termsAcceptedAt: true,
        authProvider: true,
        createdAt: true,
        playerProfile: true,
        coachProfile: {
          include: { clubLinks: { include: { club: true } } },
        },
        clubProfiles: { include: { locations: true } },
        organizerProfile: true,
      },
    });
  }

  // ─── PROFILE ACTIVATION ──────────────────────────────

  async activateProfile(userId: string, dto: ActivateProfileDto) {
    const role = dto.role as UserRole;
    const validRoles: UserRole[] = ['PLAYER', 'COACH', 'CLUB_OWNER', 'TOURNAMENT_ORGANIZER'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // Don't add duplicates
    if (user.roles.includes(role)) {
      throw new ConflictException('Profile already activated');
    }

    const updateData: any = {
      roles: { push: role },
    };

    // Create the corresponding profile
    const profileCreation: any = {};

    if (role === 'PLAYER') {
      const existing = await this.prisma.playerProfile.findUnique({ where: { userId } });
      if (!existing) profileCreation.playerProfile = { create: {} };
    } else if (role === 'COACH') {
      const existing = await this.prisma.coachProfile.findUnique({ where: { userId } });
      if (!existing) profileCreation.coachProfile = { create: { sports: [] } };
    } else if (role === 'TOURNAMENT_ORGANIZER') {
      const existing = await this.prisma.organizerProfile.findUnique({ where: { userId } });
      if (!existing) {
        profileCreation.organizerProfile = {
          create: { referralCode: this.generateReferralCode() },
        };
      }
    }
    // CLUB_OWNER profile is created when they register a club

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { ...updateData, ...profileCreation },
      select: {
        id: true,
        roles: true,
        playerProfile: true,
        coachProfile: true,
        organizerProfile: true,
      },
    });

    return updated;
  }

  // ─── OTP (mock — ready for SMS provider) ─────────────

  async requestOtp(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.updateMany({
      where: { phone },
      data: { otpCode: code, otpExpiresAt: expiresAt },
    });

    // TODO: Send SMS via provider (Twilio, etc.)
    console.log(`[OTP MOCK] Code for ${phone}: ${code}`);

    return { message: 'OTP sent', expiresIn: 600 };
  }

  async verifyOtp(phone: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('Phone not found');
    if (!user.otpCode || user.otpCode !== code) {
      throw new BadRequestException('Invalid OTP code');
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, otpCode: null, otpExpiresAt: null },
    });

    return { message: 'Phone verified', phoneVerified: true };
  }

  // ─── TERMS ───────────────────────────────────────────

  async acceptTerms(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { termsAcceptedAt: new Date() },
      select: { id: true, termsAcceptedAt: true },
    });
  }

  // ─── GOOGLE AUTH (mock — ready for integration) ──────

  async googleAuth(googleToken: string) {
    // TODO: Verify token with Google OAuth2 API
    // For now, mock the decode
    // In production: const ticket = await client.verifyIdToken({ idToken: googleToken, audience: CLIENT_ID });
    // const payload = ticket.getPayload();

    // Mock: extract from token (in real impl, verify with Google)
    throw new BadRequestException('Google OAuth not yet connected. Use email/password registration.');
  }

  // ─── PASSWORD RESET ──────────────────────────────────

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link was sent' }; // Don't reveal if email exists

    const token = randomUUID();
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600000) }, // 1 hour
    });

    // TODO: Send email with reset link
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    console.log(`[PASSWORD RESET] Link: ${process.env.FRONTEND_URL || 'http://localhost:3098'}/reset-password/${token}`);

    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
    await this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } });

    return { message: 'Password reset successfully' };
  }

  // ─── EMAIL VERIFICATION ─────────────────────────────

  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return;

    const token = randomUUID();
    await this.prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt: new Date(Date.now() + 86400000) }, // 24 hours
    });

    console.log(`[EMAIL VERIFY] Token for ${user.email}: ${token}`);
    console.log(`[EMAIL VERIFY] Link: ${process.env.FRONTEND_URL || 'http://localhost:3098'}/verify-email/${token}`);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const verifyToken = await this.prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!verifyToken || verifyToken.usedAt || verifyToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({ where: { id: verifyToken.userId }, data: { emailVerified: true } });
    await this.prisma.emailVerificationToken.update({ where: { id: verifyToken.id }, data: { usedAt: new Date() } });

    return { message: 'Email verified successfully' };
  }

  // ─── HELPERS ─────────────────────────────────────────

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private generateReferralCode(): string {
    return 'PEL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
