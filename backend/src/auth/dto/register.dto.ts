import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  googleToken: string;
}

export class RequestOtpDto {
  @ApiProperty()
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  code: string;
}

export class ActivateProfileDto {
  @ApiProperty()
  @IsString()
  role: string; // PLAYER, COACH, CLUB_OWNER, TOURNAMENT_ORGANIZER
}

export class AcceptTermsDto {
  @ApiProperty()
  accepted: boolean;
}
