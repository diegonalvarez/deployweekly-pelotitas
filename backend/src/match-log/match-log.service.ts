import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchLogDto, UpdateMatchLogDto, MatchLogParticipantDto } from './dto/match-log.dto';
import { Sport, MatchLogSide, Prisma } from '@prisma/client';

@Injectable()
export class MatchLogService {
  constructor(private prisma: PrismaService) {}

  /* ─── CREATE ───────────────────────────────────────────── */
  async create(ownerId: string, dto: CreateMatchLogDto) {
    if (dto.matchId && dto.tournamentMatchId) {
      throw new BadRequestException('Una entrada no puede estar vinculada a un Match y a un TournamentMatch al mismo tiempo');
    }

    const isLinkedToTournament = !!dto.tournamentMatchId;

    return this.prisma.matchLogEntry.create({
      data: {
        ownerId,
        matchId: dto.matchId,
        tournamentMatchId: dto.tournamentMatchId,
        sport: dto.sport,
        date: new Date(dto.date),
        startTime: dto.startTime,
        city: dto.city,
        venue: dto.venue,
        // Score fields are ignored when the entry is linked to a tournament
        // match — the official score is the tournament's truth.
        myScore: isLinkedToTournament ? null : dto.myScore,
        opponentScore: isLinkedToTournament ? null : dto.opponentScore,
        result: dto.result,
        notes: dto.notes,
        participants: dto.participants?.length
          ? { create: dto.participants.map(this.normaliseParticipant) }
          : undefined,
      },
      include: this.fullInclude(),
    });
  }

  /* ─── LIST (mine) ──────────────────────────────────────── */
  async findMine(
    ownerId: string,
    query: {
      sport?: Sport;
      from?: string;
      to?: string;
      opponent?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { sport, from, to, opponent, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MatchLogEntryWhereInput = { ownerId };
    if (sport) where.sport = sport;
    if (from || to) {
      where.date = {};
      if (from) (where.date as any).gte = new Date(from);
      if (to) (where.date as any).lte = new Date(to);
    }

    if (opponent && opponent.trim()) {
      const q = opponent.trim();
      where.participants = {
        some: {
          side: MatchLogSide.OPPONENT,
          OR: [
            { user: { firstName: { contains: q, mode: 'insensitive' } } },
            { user: { lastName: { contains: q, mode: 'insensitive' } } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [entries, total] = await Promise.all([
      this.prisma.matchLogEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: this.fullInclude(),
      }),
      this.prisma.matchLogEntry.count({ where }),
    ]);

    return { entries, total, page, totalPages: Math.ceil(total / limit) };
  }

  /* ─── GET ONE ──────────────────────────────────────────── */
  async findOne(ownerId: string, id: string) {
    const entry = await this.prisma.matchLogEntry.findUnique({
      where: { id },
      include: this.fullInclude(),
    });
    if (!entry) throw new NotFoundException('Entrada no encontrada');
    if (entry.ownerId !== ownerId) throw new ForbiddenException('No es tu entrada');
    return entry;
  }

  /* ─── UPDATE ───────────────────────────────────────────── */
  async update(ownerId: string, id: string, dto: UpdateMatchLogDto) {
    const existing = await this.prisma.matchLogEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Entrada no encontrada');
    if (existing.ownerId !== ownerId) throw new ForbiddenException('No es tu entrada');

    const isLinkedToTournament = !!existing.tournamentMatchId;

    // Replace participants in a single transaction if provided
    if (dto.participants) {
      await this.prisma.$transaction([
        this.prisma.matchLogParticipant.deleteMany({ where: { entryId: id } }),
        this.prisma.matchLogEntry.update({
          where: { id },
          data: {
            ...(dto.date ? { date: new Date(dto.date) } : {}),
            startTime: dto.startTime,
            city: dto.city,
            venue: dto.venue,
            // Drop incoming score on tournament-linked entries
            myScore: isLinkedToTournament ? null : dto.myScore,
            opponentScore: isLinkedToTournament ? null : dto.opponentScore,
            result: dto.result,
            notes: dto.notes,
            participants: { create: dto.participants.map(this.normaliseParticipant) },
          },
        }),
      ]);
    } else {
      await this.prisma.matchLogEntry.update({
        where: { id },
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}),
          startTime: dto.startTime,
          city: dto.city,
          venue: dto.venue,
          myScore: isLinkedToTournament ? null : dto.myScore,
          opponentScore: isLinkedToTournament ? null : dto.opponentScore,
          result: dto.result,
          notes: dto.notes,
        },
      });
    }

    return this.prisma.matchLogEntry.findUnique({
      where: { id },
      include: this.fullInclude(),
    });
  }

  /* ─── DELETE ───────────────────────────────────────────── */
  async remove(ownerId: string, id: string) {
    const existing = await this.prisma.matchLogEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Entrada no encontrada');
    if (existing.ownerId !== ownerId) throw new ForbiddenException('No es tu entrada');
    await this.prisma.matchLogEntry.delete({ where: { id } });
    return { ok: true };
  }

  /* ─── HEAD-TO-HEAD ─────────────────────────────────────── */
  /** Returns my history vs. a specific opponent (registered or phantom by name). */
  async opponentHistory(
    ownerId: string,
    query: { opponentUserId?: string; firstName?: string; lastName?: string },
  ) {
    const { opponentUserId, firstName, lastName } = query;

    const opponentMatch: Prisma.MatchLogParticipantWhereInput = { side: MatchLogSide.OPPONENT };
    if (opponentUserId) {
      opponentMatch.userId = opponentUserId;
    } else if (firstName || lastName) {
      if (firstName) opponentMatch.firstName = { equals: firstName, mode: 'insensitive' };
      if (lastName) opponentMatch.lastName = { equals: lastName, mode: 'insensitive' };
    } else {
      throw new BadRequestException('Indicá opponentUserId o firstName/lastName');
    }

    const entries = await this.prisma.matchLogEntry.findMany({
      where: {
        ownerId,
        participants: { some: opponentMatch },
      },
      orderBy: { date: 'desc' },
      include: this.fullInclude(),
    });

    const won = entries.filter((e) => e.result === 'WON').length;
    const lost = entries.filter((e) => e.result === 'LOST').length;
    const draw = entries.filter((e) => e.result === 'DRAW').length;

    return {
      entries,
      stats: {
        total: entries.length,
        won,
        lost,
        draw,
        winRate: entries.length > 0 ? Math.round((won / entries.length) * 100) : 0,
      },
    };
  }

  /* ─── PHANTOM CLAIM (find phantom mentions of me) ─────── */
  /** Returns participants where firstName + lastName roughly match
   *  the current user's name and userId is null. The user can claim
   *  these and have them re-attached to their account. */
  async findPhantomMentions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.matchLogParticipant.findMany({
      where: {
        userId: null,
        firstName: { equals: user.firstName, mode: 'insensitive' },
        lastName: { equals: user.lastName, mode: 'insensitive' },
      },
      include: {
        entry: {
          select: { id: true, ownerId: true, date: true, sport: true, owner: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ─── RIVALRIES ────────────────────────────────────────────
   * Computes "rivalries" at runtime: any registered opponent with whom
   * the user has at least `threshold` matches logged. Includes record
   * (won/lost/drew) from the user's perspective and last meet date.
   * No schema change required.
   * ──────────────────────────────────────────────────────── */
  async myRivalries(userId: string, threshold = 3) {
    const entries = await this.prisma.matchLogEntry.findMany({
      where: {
        ownerId: userId,
        participants: { some: { side: MatchLogSide.OPPONENT, userId: { not: null } } },
      },
      select: {
        id: true,
        date: true,
        result: true,
        sport: true,
        participants: {
          where: { side: MatchLogSide.OPPONENT, userId: { not: null } },
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    type Bucket = {
      user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
      won: number;
      lost: number;
      draw: number;
      total: number;
      lastMeet: Date;
      sports: Set<string>;
    };
    const byOpponent = new Map<string, Bucket>();

    for (const e of entries) {
      for (const p of e.participants) {
        if (!p.userId || !p.user) continue;
        const key = p.userId;
        const existing = byOpponent.get(key) ?? {
          user: p.user,
          won: 0, lost: 0, draw: 0, total: 0,
          lastMeet: e.date,
          sports: new Set<string>(),
        };
        existing.total += 1;
        existing.sports.add(e.sport);
        if (e.result === 'WON') existing.won += 1;
        else if (e.result === 'LOST') existing.lost += 1;
        else if (e.result === 'DRAW') existing.draw += 1;
        // entries are ordered desc — first time we see a key is the most recent
        if (e.date > existing.lastMeet) existing.lastMeet = e.date;
        byOpponent.set(key, existing);
      }
    }

    return Array.from(byOpponent.values())
      .filter((r) => r.total >= threshold)
      .sort((a, b) => b.total - a.total || +new Date(b.lastMeet) - +new Date(a.lastMeet))
      .map((r) => ({
        opponent: r.user,
        total: r.total,
        won: r.won,
        lost: r.lost,
        draw: r.draw,
        lastMeet: r.lastMeet,
        sports: Array.from(r.sports),
        winRate: r.total > 0 ? Math.round((r.won / r.total) * 100) : 0,
      }));
  }

  async claimPhantomMentions(userId: string, participantIds: string[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Defensive — only update rows that match the current user's name and have no userId.
    return this.prisma.matchLogParticipant.updateMany({
      where: {
        id: { in: participantIds },
        userId: null,
        firstName: { equals: user.firstName, mode: 'insensitive' },
        lastName: { equals: user.lastName, mode: 'insensitive' },
      },
      data: {
        userId,
        firstName: null,
        lastName: null,
      },
    });
  }

  /* ─── helpers ──────────────────────────────────────────── */

  private normaliseParticipant = (p: MatchLogParticipantDto) => {
    if (!p.userId && !p.firstName && !p.lastName) {
      throw new BadRequestException('Cada participante debe tener userId o firstName/lastName');
    }
    if (p.userId) {
      return {
        userId: p.userId,
        side: p.side,
        noteAboutPlayer: p.noteAboutPlayer,
      };
    }
    return {
      userId: null,
      firstName: p.firstName ?? null,
      lastName: p.lastName ?? null,
      side: p.side,
      noteAboutPlayer: p.noteAboutPlayer,
    };
  };

  private fullInclude(): Prisma.MatchLogEntryInclude {
    return {
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      match: {
        select: { id: true, sport: true, date: true, startTime: true },
      },
      tournamentMatch: {
        select: {
          id: true,
          tournamentId: true,
          tournament: { select: { id: true, name: true } },
          sets: { select: { setNumber: true, homeScore: true, awayScore: true } },
        },
      },
    };
  }
}
