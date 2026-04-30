import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import {
  UpdateCoachProfileDto,
  CoachClubLinkDto,
  SetCoachAvailabilityDto,
  CreateCoachBookingDto,
  CreateCoachReviewDto,
} from './dto/coach.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('coaches')
@Controller('coaches')
export class CoachesController {
  constructor(private coachesService: CoachesService) {}

  @Get()
  findAll(
    @Query('sport') sport?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
  ) {
    return this.coachesService.findAll({ sport, city, page: page ? parseInt(page) : 1 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCoachProfileDto,
  ) {
    return this.coachesService.updateProfile(userId, dto);
  }

  @Post('club-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  requestClubLink(
    @CurrentUser('id') userId: string,
    @Body() dto: CoachClubLinkDto,
  ) {
    return this.coachesService.requestClubLink(userId, dto);
  }

  @Post('invite/:clubId/:coachUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  inviteCoach(
    @Param('clubId') clubId: string,
    @Param('coachUserId') coachUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.coachesService.inviteCoach(clubId, coachUserId, userId);
  }

  @Patch('link/:linkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  respondToLink(
    @Param('linkId') linkId: string,
    @CurrentUser('id') userId: string,
    @Body('accept') accept: boolean,
  ) {
    return this.coachesService.respondToLink(linkId, userId, accept);
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: SetCoachAvailabilityDto,
  ) {
    return this.coachesService.setAvailability(userId, dto);
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  bookClass(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCoachBookingDto,
  ) {
    return this.coachesService.bookClass(userId, dto);
  }

  @Patch('bookings/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  approveBooking(
    @Param('id') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.coachesService.approveBooking(bookingId, userId);
  }

  @Post('auto-accept/:playerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setAutoAccept(
    @CurrentUser('id') userId: string,
    @Param('playerId') playerId: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.coachesService.setAutoAccept(userId, playerId, enabled);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCoachReviewDto,
  ) {
    return this.coachesService.createReview(userId, dto);
  }

  @Get('bookings/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyBookings(
    @CurrentUser('id') userId: string,
    @Query('role') role: 'coach' | 'student' = 'student',
  ) {
    return this.coachesService.getBookings(userId, role);
  }
}
