import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConnectionType } from '@prisma/client';

export class CreateConnectionDto {
  @ApiProperty()
  @IsString()
  toUserId: string;

  @ApiProperty({ enum: ConnectionType })
  @IsEnum(ConnectionType)
  type: ConnectionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coachId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondConnectionDto {
  @ApiProperty()
  @IsString()
  action: 'accept' | 'reject' | 'block';
}
