import { IsString, IsOptional, IsEmail, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BrochureLeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  clubName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ enum: BrochureLeadStatus, required: false })
  @IsOptional()
  @IsEnum(BrochureLeadStatus)
  status?: BrochureLeadStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
