import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  GoogleAuthDto,
  RequestOtpDto,
  VerifyOtpDto,
  ActivateProfileDto,
} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto.googleToken);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  // ─── Profile activation ──────────────────────────────

  @Post('activate-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  activateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: ActivateProfileDto,
  ) {
    return this.authService.activateProfile(userId, dto);
  }

  // ─── Password Reset ─────────────────────────────────

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  forgotPassword(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // ─── Email Verification ─────────────────────────────

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  sendVerification(@CurrentUser('id') userId: string) {
    return this.authService.sendVerificationEmail(userId);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ─── OTP ─────────────────────────────────────────────

  @Post('otp/request')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  // ─── Terms ───────────────────────────────────────────

  @Post('accept-terms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  acceptTerms(@CurrentUser('id') userId: string) {
    return this.authService.acceptTerms(userId);
  }
}
