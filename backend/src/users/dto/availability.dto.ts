import { IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto {
  @ApiProperty()
  @IsBoolean()
  isAvailableNow: boolean;

  @ApiProperty({ required: false, enum: ['PADEL', 'TENNIS'] })
  @IsOptional()
  @IsString()
  availableSport?: string;

  @ApiProperty({ required: false, description: 'Minutes from now until no longer available' })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;
}
