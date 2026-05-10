import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport, ScoringMode, ScoreboardSide, ScoreboardStatus } from '@prisma/client';

export class CreateScoreboardDto {
  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty()
  @IsString()
  homeLabel: string;

  @ApiProperty()
  @IsString()
  awayLabel: string;

  @ApiProperty({ required: false, enum: ScoringMode, default: 'STANDARD' })
  @IsOptional()
  @IsEnum(ScoringMode)
  scoringMode?: ScoringMode;

  @ApiProperty({ required: false, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  totalSets?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  superTieBreak?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(8)
  gamesPerSet?: number;

  // ─── Linkage ───
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tournamentMatchId?: string;

  @ApiProperty({ required: false, description: 'For personal mirror scoreboards' })
  @IsOptional()
  @IsString()
  mirrorsScoreboardId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateScoreboardSettingsDto {
  @ApiProperty({ required: false, enum: ScoringMode })
  @IsOptional()
  @IsEnum(ScoringMode)
  scoringMode?: ScoringMode;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  totalSets?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  superTieBreak?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(8)
  gamesPerSet?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  homeLabel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  awayLabel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, enum: ScoreboardStatus })
  @IsOptional()
  @IsEnum(ScoreboardStatus)
  status?: ScoreboardStatus;
}

export class AwardPointDto {
  @ApiProperty({ enum: ScoreboardSide })
  @IsEnum(ScoreboardSide)
  side: ScoreboardSide;
}
