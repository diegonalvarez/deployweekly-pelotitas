import {
  IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, IsInt, Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport, BookingType } from '@prisma/client';

export class UpdateCoachProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ enum: Sport, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(Sport, { each: true })
  sports?: Sport[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certifications?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  groupPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requireConnection?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoAcceptAll?: boolean;
}

export class CoachClubLinkDto {
  @ApiProperty()
  @IsString()
  clubId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class SetCoachAvailabilityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  dayOfWeek: number;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;
}

export class CreateCoachBookingDto {
  @ApiProperty()
  @IsString()
  coachId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty({ enum: BookingType, required: false })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCoachReviewDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  comment: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isWarning?: boolean;
}
