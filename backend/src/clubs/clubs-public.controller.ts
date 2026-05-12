import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ClubsService } from './clubs.service';

/** Public read-only data for the club's landing page (no auth). */
@ApiTags('public')
@Controller('public/clubs')
export class ClubsPublicController {
  constructor(private prisma: PrismaService, private clubsService: ClubsService) {}

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const club = await this.prisma.clubProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        email: true,
        website: true,
        logoUrl: true,
        imageUrl: true,
        galleryUrls: true,
        videoUrl: true,
        amenities: true,
        hoursWeekday: true,
        hoursWeekend: true,
        instagramUrl: true,
        whatsappPhone: true,
        sports: true,
        paymentMethods: true,
        isActive: true,
        deletedAt: true,
        approvalStatus: true,
        locations: {
          select: { id: true, name: true, address: true, city: true, state: true, country: true, latitude: true, longitude: true, isMain: true },
          orderBy: { isMain: 'desc' },
        },
        courts: {
          where: { isActive: true },
          select: { id: true, name: true, sport: true, surface: true, courtType: true, hasLighting: true, pricePerBlock: true, blockDuration: true },
        },
      },
    });
    if (!club || club.deletedAt || !club.isActive || club.approvalStatus !== 'APPROVED') {
      throw new NotFoundException('Complejo no disponible');
    }

    const [upcoming, inProgress] = await Promise.all([
      this.prisma.tournament.findMany({
        where: { clubId: id, status: 'REGISTRATION' },
        select: {
          id: true, name: true, sport: true, status: true, startDate: true, endDate: true,
          maxTeams: true, registrationEnd: true,
        },
        orderBy: { startDate: 'asc' },
        take: 6,
      }),
      this.prisma.tournament.findMany({
        where: { clubId: id, status: { in: ['GROUP_STAGE', 'ELIMINATION'] } },
        select: { id: true, name: true, sport: true, startDate: true, endDate: true, status: true },
        orderBy: { startDate: 'desc' },
        take: 6,
      }),
    ]);

    return { club, upcomingTournaments: upcoming, inProgressTournaments: inProgress };
  }
}
