import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrivacyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showStats?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showMatchHistory?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showLevel?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showCity?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showAvailability?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showTournaments?: boolean;
}
