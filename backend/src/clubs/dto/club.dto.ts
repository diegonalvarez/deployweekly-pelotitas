import {
  IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sport, ReservationAccessMode } from '@prisma/client';

export class CreateClubDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: Sport, isArray: true })
  @IsArray()
  @IsEnum(Sport, { each: true })
  sports: Sport[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  @ApiProperty({ enum: ReservationAccessMode, required: false })
  @IsOptional()
  @IsEnum(ReservationAccessMode)
  reservationMode?: ReservationAccessMode;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateClubDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: Sport, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(Sport, { each: true })
  sports?: Sport[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  @ApiProperty({ enum: ReservationAccessMode, required: false })
  @IsOptional()
  @IsEnum(ReservationAccessMode)
  reservationMode?: ReservationAccessMode;
}

export class CreateLocationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
