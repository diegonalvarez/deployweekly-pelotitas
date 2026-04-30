import {
  IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsInt, Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport, CourtSurface, CourtType, CourtStatus } from '@prisma/client';

export class CreateCourtDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ enum: CourtSurface })
  @IsEnum(CourtSurface)
  surface: CourtSurface;

  @ApiProperty({ enum: CourtType })
  @IsEnum(CourtType)
  courtType: CourtType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasLighting?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePerBlock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(30)
  blockDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locationId?: string;
}

export class SetAvailabilityDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  dayOfWeek: number;

  @ApiProperty()
  @IsString()
  openTime: string;

  @ApiProperty()
  @IsString()
  closeTime: string;

  @ApiProperty({ enum: CourtStatus, required: false })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;
}
