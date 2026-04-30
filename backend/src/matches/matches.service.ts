import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMatchDto, RecordResultDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateMatchDto) {
    const match = await this.prisma.match.create({
      data: {
        createdById: userId,
        sport: dto.sport,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        courtId: dto.courtId,
        maxPlayers: dto.maxPlayers || 4,
        level: dto.level,
        city: dto.city,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        participants: {
          create: { userId, team: 1 },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    return match;
  }

  async findAll(query: {
    sport?: string;
    city?: string;
    date?: string;
    status?: string;
    page?: number;
  }) {
    const { sport, city, date, status, page = 1 } = query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true };
    if (sport) where.sport = sport;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (date) where.date = new Date(date);
    if (status) where.status = status;
    else where.status = { in: ['OPEN', 'FULL'] };

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          court: { include: { club: { select: { id: true, name: true } } } },
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          _count: { select: { participants: true } },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.match.count({ where }),
    ]);

    return { matches, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        court: { include: { club: true } },
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, playerProfile: true },
            },
          },
        },
        results: { orderBy: { setNumber: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async join(matchId: string, userId: string, team?: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { _count: { select: { participants: true } } },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.status !== 'OPEN') throw new BadRequestException('Match is not open');
    if (match._count.participants >= match.maxPlayers) {
      throw new ConflictException('Match is full');
    }

    const existing = await this.prisma.matchParticipant.findUnique({
      where: { matchId_userId: { matchId, userId } },
    });
    if (existing) throw new ConflictException('Already joined');

    const participant = await this.prisma.matchParticipant.create({
      data: { matchId, userId, team },
    });

    // Check if match is now full
    const count = match._count.participants + 1;
    if (count >= match.maxPlayers) {
      await this.prisma.match.update({
        where: { id: matchId },
        data: { status: 'FULL' },
      });
    }

    // Notify match creator
    await this.notifications.create({
      userId: match.createdById,
      type: 'MATCH_INVITATION',
      title: 'Nuevo jugador en tu partido',
      message: 'Un jugador se unió a tu partido',
      data: { matchId },
    });

    return participant;
  }

  async recordResult(matchId: string, userId: string, dto: RecordResultDto) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.createdById !== userId) throw new ForbiddenException('Only creator can record results');

    // Delete existing results and recreate
    await this.prisma.matchResult.deleteMany({ where: { matchId } });

    const results = await Promise.all(
      dto.sets.map(set =>
        this.prisma.matchResult.create({
          data: {
            matchId,
            setNumber: set.setNumber,
            team1Score: set.team1Score,
            team2Score: set.team2Score,
          },
        }),
      ),
    );

    await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'COMPLETED' },
    });

    return results;
  }

  async getMyMatches(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        court: { include: { club: { select: { id: true, name: true } } } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        results: { orderBy: { setNumber: 'asc' } },
      },
      orderBy: { date: 'desc' },
    });
  }
}
