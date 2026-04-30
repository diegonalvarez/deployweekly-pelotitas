import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateClubDto, UpdateClubDto, CreateLocationDto } from './dto/club.dto';

@Injectable()
export class ClubsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(ownerId: string, dto: CreateClubDto) {
    // Add CLUB_OWNER role if not present
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (user && !user.roles.includes('CLUB_OWNER')) {
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { roles: { push: 'CLUB_OWNER' } },
      });
    }

    // In dev/local: auto-approve. In production: PENDING for admin review
    const autoApprove = process.env.NODE_ENV !== 'production';
    const club = await this.prisma.clubProfile.create({
      data: {
        ownerId,
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        sports: dto.sports,
        imageUrl: dto.imageUrl,
        paymentMethods: dto.paymentMethods || [],
        reservationMode: dto.reservationMode || 'CONNECTED_ONLY',
        approvalStatus: autoApprove ? 'APPROVED' : 'PENDING',
        approvedAt: autoApprove ? new Date() : undefined,
        locations: dto.address
          ? {
              create: {
                name: 'Sede principal',
                address: dto.address,
                city: dto.city || '',
                state: dto.state,
                isMain: true,
                latitude: dto.latitude,
                longitude: dto.longitude,
              },
            }
          : undefined,
      },
      include: { locations: true },
    });

    return {
      ...club,
      message: autoApprove
        ? 'Complejo creado y aprobado! Ya esta visible en la plataforma.'
        : 'Complejo registrado. Tu solicitud esta pendiente de aprobacion. Te contactaremos pronto.',
    };
  }

  async findAll(query: { city?: string; sport?: string; page?: number; limit?: number }) {
    const { city, sport, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Only show APPROVED clubs publicly
    const where: any = { approvalStatus: 'APPROVED', isActive: true, deletedAt: null };
    if (sport) where.sports = { has: sport };
    if (city) {
      where.locations = { some: { city: { contains: city, mode: 'insensitive' } } };
    }

    const [clubs, total] = await Promise.all([
      this.prisma.clubProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          locations: true,
          courts: { select: { id: true, sport: true, name: true } },
          _count: { select: { tournaments: true, courts: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clubProfile.count({ where }),
    ]);

    return { clubs, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const club = await this.prisma.clubProfile.findUnique({
      where: { id },
      include: {
        locations: true,
        courts: true,
        coachLinks: {
          where: { status: 'ACTIVE' },
          include: {
            coach: {
              include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
            },
          },
        },
        tournaments: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async update(clubId: string, userId: string, dto: UpdateClubDto) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.clubProfile.update({
      where: { id: clubId },
      data: dto,
    });
  }

  async addLocation(clubId: string, userId: string, dto: CreateLocationDto) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.clubLocation.create({
      data: { clubId, ...dto },
    });
  }

  async getMyClubs(userId: string) {
    return this.prisma.clubProfile.findMany({
      where: { ownerId: userId, deletedAt: null },
      include: {
        locations: true,
        _count: { select: { courts: true, tournaments: true } },
      },
    });
  }

  // ─── ADMIN APPROVAL ──────────────────────────────────

  async getPendingClubs() {
    return this.prisma.clubProfile.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        locations: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveClub(clubId: string) {
    const club = await this.prisma.clubProfile.update({
      where: { id: clubId },
      data: { approvalStatus: 'APPROVED', approvedAt: new Date() },
    });

    await this.notifications.create({
      userId: club.ownerId,
      type: 'CLUB_APPROVED',
      title: 'Complejo aprobado!',
      message: `Tu complejo "${club.name}" fue aprobado y ya esta visible en la plataforma.`,
      data: { clubId },
    });

    return club;
  }

  async rejectClub(clubId: string, reason?: string) {
    const club = await this.prisma.clubProfile.update({
      where: { id: clubId },
      data: { approvalStatus: 'REJECTED', rejectionReason: reason },
    });

    await this.notifications.create({
      userId: club.ownerId,
      type: 'CLUB_REJECTED',
      title: 'Complejo no aprobado',
      message: reason || 'Tu solicitud de complejo no fue aprobada. Contactanos para mas info.',
      data: { clubId },
    });

    return club;
  }

  // ─── MAP DATA ────────────────────────────────────────

  async getMapData() {
    const clubs = await this.prisma.clubProfile.findMany({
      where: { approvalStatus: 'APPROVED', isActive: true },
      select: {
        id: true,
        name: true,
        sports: true,
        locations: {
          where: { isMain: true },
          select: { latitude: true, longitude: true, city: true, state: true },
          take: 1,
        },
        _count: { select: { courts: true, tournaments: true } },
      },
    });
    return clubs;
  }
}
