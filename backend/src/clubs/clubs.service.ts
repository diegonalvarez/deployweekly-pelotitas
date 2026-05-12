import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateClubDto, UpdateClubDto, CreateLocationDto } from './dto/club.dto';

// Great-circle distance in kilometres between two lat/lng points.
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

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
                country: dto.country || 'Argentina',
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

  async findAll(query: {
    city?: string;
    state?: string;
    country?: string;
    sport?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    sort?: 'recent' | 'nearest';
    page?: number;
    limit?: number;
  }) {
    const {
      city, state, country, sport,
      lat, lng, radiusKm,
      sort = 'recent',
      page = 1, limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    // Only show APPROVED clubs publicly
    const where: any = { approvalStatus: 'APPROVED', isActive: true, deletedAt: null };
    if (sport) where.sports = { has: sport };

    // Compose location-filtered ClubLocation match (use AND inside `some`)
    const locationFilter: any = {};
    if (city)    locationFilter.city    = { contains: city,    mode: 'insensitive' };
    if (state)   locationFilter.state   = { contains: state,   mode: 'insensitive' };
    if (country) locationFilter.country = { contains: country, mode: 'insensitive' };
    if (Object.keys(locationFilter).length > 0) {
      where.locations = { some: locationFilter };
    }

    // ── NEAREST sort with optional radius filter ────────────────────────
    // Prisma can't sort by computed Haversine, so we fetch a bounded set
    // (location-filtered first), then sort/filter in-memory by distance.
    if (sort === 'nearest' && typeof lat === 'number' && typeof lng === 'number') {
      // Pre-narrow with a bounding box if radius is given (cheap index hit)
      if (typeof radiusKm === 'number' && radiusKm > 0) {
        const latDelta = radiusKm / 111;                                  // ~111 km / deg lat
        const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
        const boxFilter = {
          latitude:  { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
        };
        where.locations = { some: { ...locationFilter, ...boxFilter } };
      }

      const candidates = await this.prisma.clubProfile.findMany({
        where,
        include: {
          locations: true,
          courts: { select: { id: true, sport: true, name: true } },
          _count: { select: { tournaments: true, courts: true } },
        },
        take: 200, // generous cap before sorting
      });

      const withDistance = candidates
        .map((c) => {
          const main = c.locations.find((l) => l.isMain) || c.locations[0];
          if (!main || main.latitude == null || main.longitude == null) {
            return { club: c, distanceKm: Number.POSITIVE_INFINITY };
          }
          const distanceKm = haversineKm(
            { lat, lng },
            { lat: main.latitude, lng: main.longitude },
          );
          return { club: c, distanceKm };
        })
        .filter((x) => (radiusKm ? x.distanceKm <= radiusKm : true))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      const total = withDistance.length;
      const slice = withDistance.slice(skip, skip + limit);
      return {
        clubs: slice.map((x) => ({ ...x.club, distanceKm: Number.isFinite(x.distanceKm) ? Math.round(x.distanceKm * 10) / 10 : null })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        sort: 'nearest',
      };
    }

    // ── Default: recent first ──────────────────────────────────────────
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

    return { clubs, total, page, totalPages: Math.ceil(total / limit), sort: 'recent' };
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

  async update(clubId: string, userId: string, dto: UpdateClubDto, isAdmin = false) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (!isAdmin && club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.clubProfile.update({
      where: { id: clubId },
      data: dto,
    });
  }

  async addLocation(clubId: string, userId: string, dto: CreateLocationDto, isAdmin = false) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (!isAdmin && club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.clubLocation.create({
      data: { clubId, ...dto },
    });
  }

  async getMyClubs(userId: string, isAdmin = false) {
    return this.prisma.clubProfile.findMany({
      where: isAdmin ? { deletedAt: null } : { ownerId: userId, deletedAt: null },
      include: {
        locations: true,
        _count: { select: { courts: true, tournaments: true } },
      },
      orderBy: { createdAt: 'desc' },
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
