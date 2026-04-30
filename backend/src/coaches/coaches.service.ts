import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConnectionsService } from '../connections/connections.service';
import {
  UpdateCoachProfileDto,
  CoachClubLinkDto,
  SetCoachAvailabilityDto,
  CreateCoachBookingDto,
  CreateCoachReviewDto,
} from './dto/coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private connections: ConnectionsService,
  ) {}

  async updateProfile(userId: string, dto: UpdateCoachProfileDto) {
    return this.prisma.coachProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async findAll(query: { sport?: string; city?: string; page?: number }) {
    const { sport, city, page = 1 } = query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true };
    if (sport) where.sports = { has: sport };

    const [coaches, total] = await Promise.all([
      this.prisma.coachProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          clubLinks: {
            where: { status: 'ACTIVE' },
            include: {
              club: {
                include: { locations: { where: { isMain: true }, take: 1 } },
              },
            },
          },
        },
      }),
      this.prisma.coachProfile.count({ where }),
    ]);

    const filtered = city
      ? coaches.filter(c =>
          c.clubLinks.some(l =>
            (l.club as any).locations?.some((loc: any) =>
              loc.city.toLowerCase().includes(city.toLowerCase()),
            ),
          ),
        )
      : coaches;

    return { coaches: filtered, total, page };
  }

  async findOne(coachId: string) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id: coachId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        clubLinks: {
          where: { status: 'ACTIVE' },
          include: { club: { include: { locations: true } } },
        },
        availabilities: { where: { isActive: true } },
      },
    });
    if (!coach) throw new NotFoundException('Coach not found');
    return coach;
  }

  // Coach requests to join a club
  async requestClubLink(userId: string, dto: CoachClubLinkDto) {
    const coach = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) throw new NotFoundException('Coach profile not found');

    const existing = await this.prisma.coachClubLink.findUnique({
      where: { coachId_clubId: { coachId: coach.id, clubId: dto.clubId } },
    });
    if (existing) throw new ConflictException('Link already exists');

    const link = await this.prisma.coachClubLink.create({
      data: { coachId: coach.id, clubId: dto.clubId, status: 'REQUESTED', message: dto.message },
    });

    const club = await this.prisma.clubProfile.findUnique({ where: { id: dto.clubId } });
    if (club) {
      await this.notifications.create({
        userId: club.ownerId,
        type: 'COACH_INVITED',
        title: 'Solicitud de profesor',
        message: `Un profesor quiere unirse a ${club.name}`,
        data: { linkId: link.id, coachId: coach.id },
      });
    }
    return link;
  }

  async inviteCoach(clubId: string, coachUserId: string, ownerUserId: string) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== ownerUserId) throw new ForbiddenException('Not the owner');

    const coach = await this.prisma.coachProfile.findUnique({ where: { userId: coachUserId } });
    if (!coach) throw new NotFoundException('Coach not found');

    const existing = await this.prisma.coachClubLink.findUnique({
      where: { coachId_clubId: { coachId: coach.id, clubId } },
    });
    if (existing) throw new ConflictException('Link already exists');

    const link = await this.prisma.coachClubLink.create({
      data: { coachId: coach.id, clubId, status: 'INVITED' },
    });

    await this.notifications.create({
      userId: coachUserId,
      type: 'COACH_INVITED',
      title: 'Invitacion de complejo',
      message: `${club.name} te invito como profesor`,
      data: { linkId: link.id, clubId },
    });

    return link;
  }

  async respondToLink(linkId: string, userId: string, accept: boolean) {
    const link = await this.prisma.coachClubLink.findUnique({
      where: { id: linkId },
      include: { coach: true, club: true },
    });
    if (!link) throw new NotFoundException('Link not found');

    const isCoach = link.coach.userId === userId;
    const isOwner = link.club.ownerId === userId;
    if (!isCoach && !isOwner) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.coachClubLink.update({
      where: { id: linkId },
      data: { status: accept ? 'ACTIVE' : 'REJECTED' },
    });

    const notifyUserId = isCoach ? link.club.ownerId : link.coach.userId;
    await this.notifications.create({
      userId: notifyUserId,
      type: accept ? 'COACH_ACCEPTED' : 'COACH_REJECTED',
      title: accept ? 'Vinculacion aceptada' : 'Vinculacion rechazada',
      message: accept ? 'La vinculacion fue aceptada' : 'La vinculacion fue rechazada',
      data: { linkId },
    });

    return updated;
  }

  async setAvailability(userId: string, dto: SetCoachAvailabilityDto) {
    const coach = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) throw new NotFoundException('Coach profile not found');

    return this.prisma.coachAvailability.create({
      data: {
        coachId: coach.id,
        clubId: dto.clubId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  // ─── BOOKING WITH CONNECTION CHECK ───────────────────

  async bookClass(userId: string, dto: CreateCoachBookingDto) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id: dto.coachId },
    });
    if (!coach) throw new NotFoundException('Coach not found');

    // Check if connection is required
    if (coach.requireConnection) {
      const isConnected = await this.connections.isConnected(
        userId, coach.userId, 'PLAYER_COACH', coach.id,
      );
      if (!isConnected) {
        throw new ForbiddenException(
          'Debes estar conectado con este profesor para reservar. Enviale una solicitud primero.',
        );
      }
    }

    // Determine booking status based on auto-accept settings
    let status: 'PENDING' | 'CONFIRMED' = 'PENDING';

    if (coach.autoAcceptAll) {
      status = 'CONFIRMED';
    } else {
      // Check per-player auto-accept
      const autoAccept = await this.prisma.coachAutoAccept.findUnique({
        where: { coachId_playerId: { coachId: coach.id, playerId: userId } },
      });
      if (autoAccept) status = 'CONFIRMED';
    }

    const booking = await this.prisma.coachBooking.create({
      data: {
        coachId: dto.coachId,
        studentId: userId,
        clubId: dto.clubId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        type: dto.type || 'INDIVIDUAL',
        sport: dto.sport,
        price: coach.pricePerHour,
        notes: dto.notes,
        status,
      },
    });

    // Notify coach
    await this.notifications.create({
      userId: coach.userId,
      type: 'CLASS_BOOKED',
      title: status === 'CONFIRMED' ? 'Nueva clase confirmada' : 'Solicitud de clase',
      message: `Tienes una ${status === 'CONFIRMED' ? 'clase confirmada' : 'solicitud de clase'} el ${dto.date} a las ${dto.startTime}`,
      data: { bookingId: booking.id },
    });

    // Notify student
    await this.notifications.create({
      userId,
      type: status === 'CONFIRMED' ? 'CLASS_APPROVED' : 'CLASS_PRE_APPROVED',
      title: status === 'CONFIRMED' ? 'Clase confirmada' : 'Solicitud enviada',
      message: status === 'CONFIRMED'
        ? `Tu clase fue confirmada para el ${dto.date} a las ${dto.startTime}`
        : 'Tu solicitud de clase fue enviada. Esperando aprobacion del profesor.',
      data: { bookingId: booking.id },
    });

    return booking;
  }

  async approveBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.coachBooking.findUnique({
      where: { id: bookingId },
      include: { coach: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.coach.userId !== userId) throw new ForbiddenException('Not the coach');

    const updated = await this.prisma.coachBooking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    await this.notifications.create({
      userId: booking.studentId,
      type: 'CLASS_APPROVED',
      title: 'Clase aprobada!',
      message: `Tu clase del ${booking.date.toISOString().split('T')[0]} a las ${booking.startTime} fue aprobada.`,
      data: { bookingId },
    });

    return updated;
  }

  // ─── AUTO-ACCEPT MANAGEMENT ──────────────────────────

  async setAutoAccept(userId: string, playerId: string, enabled: boolean) {
    const coach = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) throw new NotFoundException('Coach profile not found');

    if (enabled) {
      return this.prisma.coachAutoAccept.upsert({
        where: { coachId_playerId: { coachId: coach.id, playerId } },
        create: { coachId: coach.id, playerId },
        update: {},
      });
    } else {
      return this.prisma.coachAutoAccept.deleteMany({
        where: { coachId: coach.id, playerId },
      });
    }
  }

  // ─── COACH REVIEWS (private, admin-visible) ──────────

  async createReview(userId: string, dto: CreateCoachReviewDto) {
    const coach = await this.prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) throw new NotFoundException('Coach profile not found');

    return this.prisma.coachStudentReview.create({
      data: {
        coachId: coach.id,
        authorId: userId,
        studentId: dto.studentId,
        comment: dto.comment,
        isWarning: dto.isWarning || false,
      },
    });
  }

  async getBookings(userId: string, role: 'coach' | 'student') {
    if (role === 'coach') {
      const coach = await this.prisma.coachProfile.findUnique({ where: { userId } });
      if (!coach) throw new NotFoundException('Coach profile not found');
      return this.prisma.coachBooking.findMany({
        where: { coachId: coach.id },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
      });
    }
    return this.prisma.coachBooking.findMany({
      where: { studentId: userId },
      include: {
        coach: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
