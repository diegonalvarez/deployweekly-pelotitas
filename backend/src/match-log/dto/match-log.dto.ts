import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Sport, MatchOutcome, MatchLogSide } from '@prisma/client';

export class MatchLogParticipantDto {
  @ApiProperty({ enum: MatchLogSide })
  @IsEnum(MatchLogSide)
  side: MatchLogSide;

  /** Linked user (registered on pelotitas). */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  /** Phantom — provide first/last name when not registered yet. */
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
  noteAboutPlayer?: string;
}

export class CreateMatchLogDto {
  // ─── Linkage (optional) ───────────────────────
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tournamentMatchId?: string;

  // ─── Match info ───────────────────────────────
  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty()
  @IsDateString()
  date: string; // YYYY-MM-DD

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venue?: string;

  // ─── Score (only honoured when not linked to a TournamentMatch) ───
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  myScore?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  opponentScore?: string;

  @ApiProperty({ required: false, enum: MatchOutcome })
  @IsOptional()
  @IsEnum(MatchOutcome)
  result?: MatchOutcome;

  // ─── Notes ────────────────────────────────────
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  // ─── Participants (partners + opponents) ──────
  @ApiProperty({ type: [MatchLogParticipantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchLogParticipantDto)
  participants?: MatchLogParticipantDto[];
}

export class UpdateMatchLogDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  myScore?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  opponentScore?: string;

  @ApiProperty({ required: false, enum: MatchOutcome })
  @IsOptional()
  @IsEnum(MatchOutcome)
  result?: MatchOutcome;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [MatchLogParticipantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchLogParticipantDto)
  participants?: MatchLogParticipantDto[];
}
