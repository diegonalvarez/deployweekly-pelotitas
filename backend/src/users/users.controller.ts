import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdatePlayerProfileDto, UpdateUserDto } from './dto/update-profile.dto';
import { UpdateAvailabilityDto } from './dto/availability.dto';
import { UpdatePrivacyDto } from './dto/privacy.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ─── EXISTING ENDPOINTS ─────────────────────────────────

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateUser(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }

  @Patch('me/player-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updatePlayerProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePlayerProfileDto,
  ) {
    return this.usersService.updatePlayerProfile(userId, dto);
  }

  @Get('search')
  searchPlayers(
    @Query('city') city?: string,
    @Query('sport') sport?: string,
    @Query('minLevel') minLevel?: string,
    @Query('maxLevel') maxLevel?: string,
    @Query('page') page?: string,
  ) {
    return this.usersService.searchPlayers({
      city,
      sport,
      minLevel: minLevel ? parseFloat(minLevel) : undefined,
      maxLevel: maxLevel ? parseFloat(maxLevel) : undefined,
      page: page ? parseInt(page) : 1,
    });
  }

  /**
   * Match a list of E.164 phone numbers against registered users.
   * Used by the "Import contacts" flow — frontend reads contacts via
   * the Web Contacts Picker API (or @capacitor/contacts on native),
   * normalises to E.164, and POSTs the array here. Returns the subset
   * already on pelotitas plus a "notOnPelotitas" remainder so the UI
   * can offer an invite link.
   */
  @Post('lookup-by-phones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  lookupByPhones(
    @CurrentUser('id') userId: string,
    @Body() body: { phones: string[] },
  ) {
    return this.usersService.lookupByPhones(userId, body?.phones || []);
  }

  // ─── RANKING ────────────────────────────────────────────

  @Get('ranking')
  getRanking(
    @Query('sport') sport?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
  ) {
    return this.usersService.getRanking({
      sport,
      city,
      page: page ? parseInt(page) : 1,
    });
  }

  // ─── AVAILABILITY ───────────────────────────────────────

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.usersService.updateAvailability(userId, dto);
  }

  @Get('available')
  getAvailablePlayers(
    @Query('sport') sport?: string,
    @Query('city') city?: string,
  ) {
    return this.usersService.getAvailablePlayers({ sport, city });
  }

  // ─── PRIVACY ────────────────────────────────────────────

  @Patch('me/privacy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updatePrivacy(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePrivacyDto,
  ) {
    return this.usersService.updatePrivacy(userId, dto);
  }

  // ─── CALENDAR ───────────────────────────────────────────

  @Get('me/calendar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCalendar(
    @CurrentUser('id') userId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.usersService.getCalendar(userId, from, to);
  }

  // ─── PUBLIC PROFILE & TIMELINE ──────────────────────────

  @Get(':id/timeline')
  getTimeline(
    @Param('id') id: string,
    @Query('page') page?: string,
  ) {
    return this.usersService.getTimeline(id, page ? parseInt(page) : 1);
  }

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
