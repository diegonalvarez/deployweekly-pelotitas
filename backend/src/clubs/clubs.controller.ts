import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto, CreateLocationDto } from './dto/club.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private clubsService: ClubsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateClubDto) {
    return this.clubsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('sport') sport?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('sort') sort?: 'recent' | 'nearest',
    @Query('page') page?: string,
  ) {
    return this.clubsService.findAll({
      city,
      state,
      country,
      sport,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
      sort,
      page: page ? parseInt(page) : 1,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyClubs(@CurrentUser('id') userId: string) {
    return this.clubsService.getMyClubs(userId);
  }

  @Get('map')
  getMapData() {
    return this.clubsService.getMapData();
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  getPendingClubs() {
    return this.clubsService.getPendingClubs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, userId, dto);
  }

  @Post(':id/locations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addLocation(
    @Param('id') clubId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.clubsService.addLocation(clubId, userId, dto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  approveClub(@Param('id') id: string) {
    return this.clubsService.approveClub(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  rejectClub(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.clubsService.rejectClub(id, reason);
  }
}
