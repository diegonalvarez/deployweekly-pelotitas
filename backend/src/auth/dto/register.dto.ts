import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;

  // ── Optional home location (origin) ──────────────────────────────
  @ApiProperty({ required: false, description: 'Country of origin (home)' })
  @IsOptional()
  @IsString()
  homeCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  homeState?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  homeCity?: string;

  // ── Optional current location (where user is right now) ──────────
  @ApiProperty({ required: false, description: 'Country where user is right now (if travelling)' })
  @IsOptional()
  @IsString()
  currentCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentState?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentCity?: string;
}

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  googleToken: string;
}

export class RequestOtpDto {
  @ApiProperty()
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  code: string;
}

export class ActivateProfileDto {
  @ApiProperty()
  @IsString()
  role: string; // PLAYER, COACH, CLUB_OWNER, TOURNAMENT_ORGANIZER
}

export class AcceptTermsDto {
  @ApiProperty()
  accepted: boolean;
}
