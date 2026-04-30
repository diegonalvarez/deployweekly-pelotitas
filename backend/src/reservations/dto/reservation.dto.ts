import { IsString, IsEnum, IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport } from '@prisma/client';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  courtId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRecurringDto {
  @ApiProperty()
  @IsString()
  courtId: string;

  @ApiProperty({ description: 'Day of week 0-6 (Sun-Sat)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ description: 'Start date ISO string' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false, description: 'End date ISO string' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class JoinWaitlistDto {
  @ApiProperty()
  @IsString()
  courtId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;
}
