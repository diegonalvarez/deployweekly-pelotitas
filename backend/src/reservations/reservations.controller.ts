import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, CreateRecurringDto, JoinWaitlistDto } from './dto/reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyReservations(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.reservationsService.findMyReservations(userId, status);
  }

  @Get('club/:clubId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByClub(
    @Param('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.findByClub(clubId, userId, date);
  }

  @Get('alternatives')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAlternatives(
    @Query('courtId') courtId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('sport') sport?: string,
  ) {
    return this.reservationsService.suggestAlternatives(courtId, date, startTime, sport);
  }

  // ─── Recurring Reservations ─────────────────────────

  @Post('recurring')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createRecurring(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRecurringDto,
  ) {
    return this.reservationsService.createRecurring(userId, dto);
  }

  @Get('recurring')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyRecurring(
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.findMyRecurring(userId);
  }

  @Delete('recurring/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancelRecurring(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancelRecurring(id, userId);
  }

  // ─── Waitlist ───────────────────────────────────────

  @Post('waitlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  joinWaitlist(
    @CurrentUser('id') userId: string,
    @Body() dto: JoinWaitlistDto,
  ) {
    return this.reservationsService.joinWaitlist(userId, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancel(id, userId);
  }

  // ─── Matchmaking — open slots ───────────────────────────

  @Get('open-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOpenSlots(
    @CurrentUser('id') userId: string,
    @Query('clubId') clubId?: string,
    @Query('sport') sport?: string,
    @Query('city') city?: string,
  ) {
    return this.reservationsService.findOpenSlots({ userId, clubId, sport, city });
  }

  @Patch(':id/open')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  openForJoin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: {
      slotsNeeded: number;
      joinLevelMin?: string;
      joinLevelMax?: string;
      joinNote?: string;
    },
  ) {
    return this.reservationsService.openForJoin(id, userId, body);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  closeForJoin(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reservationsService.closeForJoin(id, userId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  requestJoin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { message?: string },
  ) {
    return this.reservationsService.requestJoin(id, userId, body?.message);
  }

  @Patch('joins/:joinId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  respondJoin(
    @Param('joinId') joinId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { accept: boolean },
  ) {
    return this.reservationsService.respondJoin(joinId, userId, !!body?.accept);
  }
}
