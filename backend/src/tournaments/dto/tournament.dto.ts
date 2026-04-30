import {
  IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsDateString, IsArray, Min, IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class CreateTournamentDto {
  @ApiProperty()
  @IsString()
  clubId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  maxTeams?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  registrationEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pointsPerWin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pointsPerLoss?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  pointsPerWalkover?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tiebreakers?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rules?: string;
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  maxTeams?: number;
}

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  playerIds: string[];
}

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  qualifyCount?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  teamIds: string[];
}

export class GenerateGroupsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty()
  @IsInt()
  @Min(2)
  numberOfGroups: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  qualifyPerGroup?: number;
}

export class RecordTournamentMatchResultDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  winnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isWalkover?: boolean;

  @ApiProperty({ type: [Object] })
  @IsArray()
  sets: { setNumber: number; homeScore: number; awayScore: number }[];
}

export class OverrideStandingDto {
  @ApiProperty()
  @IsString()
  teamId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isQualified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  points?: number;
}

export class GenerateBracketsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateBracketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  homeTeamId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  awayTeamId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  winnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBye?: boolean;
}
