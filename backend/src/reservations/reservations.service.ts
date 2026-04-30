import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto, CreateRecurringDto, JoinWaitlistDto } from './dto/reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateReservationDto) {
    // Check for conflicts
    const existing = await this.prisma.reservation.findFirst({
      where: {
        courtId: dto.courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existing) {
      throw new ConflictException('Time slot already reserved');
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        courtId: dto.courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        sport: dto.sport,
        notes: dto.notes,
        status: 'CONFIRMED',
      },
      include: {
        court: { include: { club: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Emit notification
    await this.notifications.create({
      userId,
      type: 'RESERVATION_CREATED',
      title: 'Reserva confirmada',
      message: `Tu reserva en ${reservation.court.club.name} - ${reservation.court.name} para el ${dto.date} a las ${dto.startTime} fue confirmada.`,
      data: { reservationId: reservation.id },
    });

    return reservation;
  }

  async findMyReservations(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.reservation.findMany({
      where,
      include: {
        court: { include: { club: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByClub(clubId: string, userId: string, date?: string) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    const where: any = { court: { clubId } };
    if (date) where.date = new Date(date);

    return this.prisma.reservation.findMany({
      where,
      include: {
        court: true,
        user: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async cancel(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { court: { include: { club: true } } },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.userId !== userId && reservation.court.club.ownerId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    await this.notifications.create({
      userId: reservation.userId,
      type: 'RESERVATION_CANCELLED',
      title: 'Reserva cancelada',
      message: `Tu reserva del ${reservation.date.toISOString().split('T')[0]} a las ${reservation.startTime} fue cancelada.`,
      data: { reservationId },
    });

    // Check waitlist and notify first person
    await this.notifyWaitlist(
      reservation.courtId,
      reservation.date,
      reservation.startTime,
      reservation.court.club.name,
      reservation.court.name,
    );

    return updated;
  }

  // ─── SMART SCHEDULING ──────────────────────────────────

  /**
   * Suggest alternative slots when a desired time is taken.
   * Returns same-court alternatives (different times) and other-court alternatives (same time).
   */
  async suggestAlternatives(courtId: string, date: string, startTime: string, sport?: string) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { club: true },
    });
    if (!court) throw new NotFoundException('Court not found');

    const dateObj = new Date(date);

    // 1. Find all reservations on this court for this date
    const courtReservations = await this.prisma.reservation.findMany({
      where: {
        courtId,
        date: dateObj,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { startTime: true },
    });
    const takenTimes = new Set(courtReservations.map(r => r.startTime));

    // Get court availability for this day of week
    const dayOfWeek = dateObj.getDay();
    const courtAvail = await this.prisma.courtAvailability.findFirst({
      where: { courtId, dayOfWeek },
    });

    // Build same-court alternatives: other available times today
    const sameCourtAlternatives: { time: string; endTime: string }[] = [];
    if (courtAvail) {
      const openHour = parseInt(courtAvail.openTime.split(':')[0], 10);
      const closeHour = parseInt(courtAvail.closeTime.split(':')[0], 10);
      const blockMinutes = court.blockDuration || 60;

      for (let h = openHour; h < closeHour; h++) {
        for (let m = 0; m < 60; m += blockMinutes) {
          const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          if (!takenTimes.has(time) && time !== startTime) {
            const endMinutes = h * 60 + m + blockMinutes;
            const endH = Math.floor(endMinutes / 60);
            const endM = endMinutes % 60;
            const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            sameCourtAlternatives.push({ time, endTime });
          }
        }
      }
    }

    // 2. Find same time on other courts at the same club
    const otherCourts = await this.prisma.court.findMany({
      where: {
        clubId: court.clubId,
        id: { not: courtId },
        isActive: true,
        ...(sport ? { sport: sport as any } : {}),
      },
    });

    const otherCourtAlternatives: { courtId: string; courtName: string; sport: string; time: string; endTime: string }[] = [];
    for (const oc of otherCourts) {
      const ocReservation = await this.prisma.reservation.findFirst({
        where: {
          courtId: oc.id,
          date: dateObj,
          startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (!ocReservation) {
        const blockMinutes = oc.blockDuration || 60;
        const [h, m] = startTime.split(':').map(Number);
        const endMinutes = h * 60 + m + blockMinutes;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        otherCourtAlternatives.push({
          courtId: oc.id,
          courtName: oc.name,
          sport: oc.sport,
          time: startTime,
          endTime,
        });
      }
    }

    return { sameCourtAlternatives, otherCourtAlternatives };
  }

  /**
   * Create a recurring reservation and auto-generate individual reservations for the next 4 weeks.
   */
  async createRecurring(userId: string, dto: CreateRecurringDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      include: { club: true },
    });
    if (!court) throw new NotFoundException('Court not found');

    const recurring = await this.prisma.recurringReservation.create({
      data: {
        userId,
        courtId: dto.courtId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        sport: dto.sport,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    // Generate individual reservations for next 4 weeks
    const createdReservations: any[] = [];
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    for (let week = 0; week < 4; week++) {
      const date = new Date(startDate);
      // Find the next occurrence of dayOfWeek from startDate + week offset
      const currentDay = date.getDay();
      let daysUntilTarget = dto.dayOfWeek - currentDay;
      if (daysUntilTarget < 0) daysUntilTarget += 7;
      date.setDate(date.getDate() + daysUntilTarget + week * 7);

      // Skip if before startDate or after endDate
      if (date < startDate) continue;
      if (endDate && date > endDate) break;

      // Check for conflicts
      const existing = await this.prisma.reservation.findFirst({
        where: {
          courtId: dto.courtId,
          date,
          startTime: dto.startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (!existing) {
        const reservation = await this.prisma.reservation.create({
          data: {
            userId,
            courtId: dto.courtId,
            date,
            startTime: dto.startTime,
            endTime: dto.endTime,
            sport: dto.sport,
            status: 'CONFIRMED',
            notes: `Reserva recurrente (${recurring.id})`,
          },
        });
        createdReservations.push(reservation);
      }
    }

    return { recurring, createdReservations };
  }

  /**
   * Get user's recurring reservations.
   */
  async findMyRecurring(userId: string) {
    return this.prisma.recurringReservation.findMany({
      where: { userId, isActive: true },
      include: {
        court: { include: { club: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cancel a recurring reservation (deactivate it).
   */
  async cancelRecurring(recurringId: string, userId: string) {
    const recurring = await this.prisma.recurringReservation.findUnique({
      where: { id: recurringId },
    });
    if (!recurring) throw new NotFoundException('Recurring reservation not found');
    if (recurring.userId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.recurringReservation.update({
      where: { id: recurringId },
      data: { isActive: false },
    });
  }

  /**
   * Add user to waitlist for a specific slot.
   */
  async joinWaitlist(userId: string, dto: JoinWaitlistDto) {
    // Check if user is already on waitlist for this slot
    const existing = await this.prisma.waitlist.findFirst({
      where: {
        userId,
        courtId: dto.courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        notified: false,
      },
    });

    if (existing) {
      throw new ConflictException('Ya estas en la lista de espera para este turno');
    }

    return this.prisma.waitlist.create({
      data: {
        userId,
        courtId: dto.courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        sport: dto.sport,
      },
      include: {
        court: { include: { club: { select: { id: true, name: true } } } },
      },
    });
  }

  /**
   * When a reservation is cancelled, notify the first person on the waitlist.
   */
  private async notifyWaitlist(
    courtId: string,
    date: Date,
    startTime: string,
    clubName: string,
    courtName: string,
  ) {
    const waitlistEntry = await this.prisma.waitlist.findFirst({
      where: {
        courtId,
        date,
        startTime,
        notified: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (waitlistEntry) {
      await this.prisma.waitlist.update({
        where: { id: waitlistEntry.id },
        data: { notified: true },
      });

      await this.notifications.create({
        userId: waitlistEntry.userId,
        type: 'WAITLIST_AVAILABLE',
        title: 'Turno disponible!',
        message: `Se libero un turno en ${clubName} - ${courtName} el ${date.toISOString().split('T')[0]} a las ${startTime}. Reservalo antes de que otro lo tome!`,
        data: {
          courtId,
          date: date.toISOString().split('T')[0],
          startTime,
          sport: waitlistEntry.sport,
        },
      });
    }
  }
}
