import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN' as any)
@ApiBearerAuth()
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard')
  async getDashboard() {
    const [users, clubs, clubsPending, tournaments, reservations, notifications, coaches, players] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.clubProfile.count({ where: { approvalStatus: 'APPROVED' } }),
        this.prisma.clubProfile.count({ where: { approvalStatus: 'PENDING' } }),
        this.prisma.tournament.count(),
        this.prisma.reservation.count(),
        this.prisma.notification.count(),
        this.prisma.coachProfile.count(),
        this.prisma.playerProfile.count(),
      ]);
    return { users, clubs, clubsPending, tournaments, reservations, notifications, coaches, players };
  }

  @Get('users')
  async getUsers(
    @Query('page') page = '1',
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('identityStatus') identityStatus?: string,
  ) {
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    const where: any = {};
    if (role) where.roles = { has: role };
    if (identityStatus) where.identityStatus = identityStatus;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          roles: true, isActive: true, identityStatus: true, phoneVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page: parseInt(page) };
  }

  @Get('clubs')
  async getClubs(
    @Query('page') page = '1',
    @Query('status') status?: string,
  ) {
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    const where: any = {};
    if (status) where.approvalStatus = status;

    const [clubs, total] = await Promise.all([
      this.prisma.clubProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          locations: { where: { isMain: true }, take: 1 },
          _count: { select: { courts: true, tournaments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clubProfile.count({ where }),
    ]);
    return { clubs, total };
  }

  @Get('tournaments')
  async getTournaments(
    @Query('page') page = '1',
    @Query('status') status?: string,
  ) {
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        skip,
        take: limit,
        include: {
          club: {
            include: { locations: { where: { isMain: true }, take: 1 } },
          },
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { teams: true, matches: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tournament.count({ where }),
    ]);

    // Enrich with billing info
    const enriched = await Promise.all(
      tournaments.map(async (t) => {
        const organizerProfile = await this.prisma.organizerProfile.findUnique({
          where: { userId: t.createdById },
        });
        return {
          ...t,
          organizerFreeTournamentsUsed: organizerProfile?.freeTournamentsUsed || 0,
          organizerFreeTournamentsLimit: organizerProfile?.freeTournamentsLimit || 5,
          shouldBeBilled: t.isBillable,
        };
      }),
    );

    return { tournaments: enriched, total };
  }

  @Get('coaches')
  async getCoaches(@Query('page') page = '1') {
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    const [coaches, total] = await Promise.all([
      this.prisma.coachProfile.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          clubLinks: { where: { status: 'ACTIVE' }, include: { club: { select: { name: true } } } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coachProfile.count(),
    ]);
    return { coaches, total };
  }

  @Get('reviews')
  async getStudentReviews(@Query('page') page = '1', @Query('warningsOnly') warningsOnly?: string) {
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;
    const where: any = {};
    if (warningsOnly === 'true') where.isWarning = true;

    return this.prisma.coachStudentReview.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        coach: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('feature-flags')
  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany();
  }

  @Patch('feature-flags/:key')
  async updateFeatureFlag(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  @Patch('users/:id/toggle-active')
  async toggleUserActive(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  @Patch('users/:id/verify-identity')
  async verifyIdentity(@Param('id') id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { identityStatus: 'VERIFIED', identityVerifiedAt: new Date() },
    });
  }
}
