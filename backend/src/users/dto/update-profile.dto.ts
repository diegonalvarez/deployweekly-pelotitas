import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HandPreference, Sport } from '@prisma/client';

export class UpdatePlayerProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  // ── Home location (origin) ───────────────────────────────────────
  @ApiProperty({ required: false })
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

  // ── Current location (where user is right now) ───────────────────
  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentLatitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentLongitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, enum: HandPreference })
  @IsOptional()
  @IsEnum(HandPreference)
  hand?: HandPreference;

  @ApiProperty({ required: false, enum: Sport, isArray: true })
  @IsOptional()
  sports?: Sport[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  padelLevel?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  tennisLevel?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredPosition?: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
