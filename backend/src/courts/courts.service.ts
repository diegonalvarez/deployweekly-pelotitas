import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto, SetAvailabilityDto } from './dto/court.dto';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(clubId: string, userId: string, dto: CreateCourtDto) {
    const club = await this.prisma.clubProfile.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.court.create({
      data: {
        clubId,
        name: dto.name,
        sport: dto.sport,
        surface: dto.surface,
        courtType: dto.courtType,
        hasLighting: dto.hasLighting,
        pricePerBlock: dto.pricePerBlock,
        blockDuration: dto.blockDuration,
        locationId: dto.locationId,
      },
    });
  }

  async findByClub(clubId: string) {
    return this.prisma.court.findMany({
      where: { clubId, isActive: true },
      include: { availabilities: true },
    });
  }

  async setAvailability(courtId: string, userId: string, dto: SetAvailabilityDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { club: true },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (court.club.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.courtAvailability.upsert({
      where: { courtId_dayOfWeek: { courtId, dayOfWeek: dto.dayOfWeek } },
      create: { courtId, ...dto },
      update: dto,
    });
  }

  async getAvailability(courtId: string, date: string) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { availabilities: true },
    });
    if (!court) throw new NotFoundException('Court not found');

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const availability = court.availabilities.find(a => a.dayOfWeek === dayOfWeek);

    if (!availability || availability.status !== 'AVAILABLE') {
      return { court, slots: [], message: 'Court not available on this day' };
    }

    // Get existing reservations for this date
    const reservations = await this.prisma.reservation.findMany({
      where: {
        courtId,
        date: dateObj,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    // Generate time slots
    const slots = this.generateSlots(
      availability.openTime,
      availability.closeTime,
      court.blockDuration,
      reservations.map(r => ({ start: r.startTime, end: r.endTime })),
    );

    return { court, date, slots };
  }

  private generateSlots(
    open: string,
    close: string,
    duration: number,
    booked: { start: string; end: string }[],
  ) {
    const slots: { time: string; endTime: string; available: boolean }[] = [];
    let [h, m] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);

    while (h * 60 + m + duration <= closeH * 60 + closeM) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endMinutes = h * 60 + m + duration;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const isBooked = booked.some(b => b.start === time);
      slots.push({ time, endTime, available: !isBooked });

      m += duration;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }

    return slots;
  }
}
