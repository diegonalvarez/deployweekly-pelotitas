import {
  IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsInt, IsDateString, IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class CreateMatchDto {
  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courtId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  maxPlayers?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class RecordResultDto {
  @ApiProperty({ type: [Object] })
  @IsArray()
  sets: { setNumber: number; team1Score: number; team2Score: number }[];
}
