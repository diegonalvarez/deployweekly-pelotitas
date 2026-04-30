import {
  Controller, Get, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CreateCourtDto, SetAvailabilityDto } from './dto/court.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('courts')
@Controller()
export class CourtsController {
  constructor(private courtsService: CourtsService) {}

  @Post('clubs/:clubId/courts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Param('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourtDto,
  ) {
    return this.courtsService.create(clubId, userId, dto);
  }

  @Get('clubs/:clubId/courts')
  findByClub(@Param('clubId') clubId: string) {
    return this.courtsService.findByClub(clubId);
  }

  @Post('courts/:courtId/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setAvailability(
    @Param('courtId') courtId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.courtsService.setAvailability(courtId, userId, dto);
  }

  @Get('courts/:courtId/availability')
  getAvailability(
    @Param('courtId') courtId: string,
    @Query('date') date: string,
  ) {
    return this.courtsService.getAvailability(courtId, date);
  }
}
