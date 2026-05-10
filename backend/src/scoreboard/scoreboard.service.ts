import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScoreboardDto,
  UpdateScoreboardSettingsDto,
  AwardPointDto,
} from './dto/scoreboard.dto';
import {
  Prisma,
  Scoreboard,
  ScoreboardStatus,
  ScoreboardSide,
} from '@prisma/client';
import {
  awardPoint,
  initialState,
  SbState,
  Side,
} from './score-engine';

@Injectable()
export class ScoreboardService {
  constructor(private prisma: PrismaService) {}

  /* ─── CREATE ───────────────────────────────────────────── */
  async create(userId: string, dto: CreateScoreboardDto) {
    // If linking to an official tournament match, verify the user is the
    // tournament organiser (or admin) when isOfficial=true.
    if (dto.isOfficial && dto.tournamentMatchId) {
      const tm = await this.prisma.tournamentMatch.findUnique({
        where: { id: dto.tournamentMatchId },
        include: { tournament: { select: { createdById: true } } },
      });
      if (!tm) throw new NotFoundException('Partido de torneo no encontrado');
      const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { roles: true } });
      const isAdmin = u?.roles.includes('ADMIN');
      if (!isAdmin && tm.tournament.createdById !== userId) {
        throw new ForbiddenException('Sólo el organizador puede crear el anotador oficial');
      }
    }

    // Reuse if already exists for same (owner, tournamentMatch).
    if (dto.tournamentMatchId) {
      const existing = await this.prisma.scoreboard.findUnique({
        where: {
          ownerId_tournamentMatchId: {
            ownerId: userId,
            tournamentMatchId: dto.tournamentMatchId,
          },
        },
      });
      if (existing) return this.findOne(userId, existing.id);
    }

    const seed = initialState({
      scoringMode: dto.scoringMode || 'STANDARD',
      totalSets: dto.totalSets ?? 3,
      gamesPerSet: dto.gamesPerSet ?? 6,
      superTieBreak: dto.superTieBreak ?? false,
    });

    const sb = await this.prisma.scoreboard.create({
      data: {
        ownerId: userId,
        sport: dto.sport,
        homeLabel: dto.homeLabel,
        awayLabel: dto.awayLabel,
        scoringMode: seed.scoringMode,
        totalSets: seed.totalSets,
        gamesPerSet: seed.gamesPerSet,
        tieBreakAt: seed.tieBreakAt,
        superTieBreak: seed.superTieBreak,
        tieBreakPoints: seed.tieBreakPoints,
        superTieBreakPoints: seed.superTieBreakPoints,
        status: seed.status,
        currentSet: seed.currentSet,
        homeSetGames: seed.homeSetGames,
        awaySetGames: seed.awaySetGames,
        homePoints: seed.homePoints,
        awayPoints: seed.awayPoints,
        homeAdvantage: seed.homeAdvantage,
        awayAdvantage: seed.awayAdvantage,
        inTieBreak: seed.inTieBreak,
        inSuperTieBreak: seed.inSuperTieBreak,
        homeTbPoints: seed.homeTbPoints,
        awayTbPoints: seed.awayTbPoints,
        servingSide: seed.servingSide as ScoreboardSide,
        isOfficial: dto.isOfficial ?? false,
        tournamentMatchId: dto.tournamentMatchId,
        mirrorsScoreboardId: dto.mirrorsScoreboardId,
        notes: dto.notes,
        events: {
          create: {
            authorId: userId,
            action: 'CREATE',
            payload: { initialSettings: seed } as any,
          },
        },
      },
      include: this.fullInclude(),
    });
    return sb;
  }

  /* ─── LIST mine ────────────────────────────────────────── */
  async findMine(userId: string, query: { status?: ScoreboardStatus }) {
    const where: Prisma.ScoreboardWhereInput = { ownerId: userId };
    if (query.status) where.status = query.status;
    return this.prisma.scoreboard.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: this.fullInclude(),
    });
  }

  /** Find scoreboards related to a tournament match — both the official one
   *  (if any) and the calling user's own personal mirror. */
  async findByTournamentMatch(userId: string, tournamentMatchId: string) {
    const sbs = await this.prisma.scoreboard.findMany({
      where: {
        tournamentMatchId,
        OR: [{ isOfficial: true }, { ownerId: userId }],
      },
      include: this.fullInclude(),
      orderBy: [{ isOfficial: 'desc' }, { createdAt: 'asc' }],
    });
    const official = sbs.find((s) => s.isOfficial) || null;
    const mine = sbs.find((s) => !s.isOfficial && s.ownerId === userId) || null;
    return { official, mine };
  }

  /* ─── GET one ──────────────────────────────────────────── */
  async findOne(userId: string, id: string) {
    const sb = await this.prisma.scoreboard.findUnique({
      where: { id },
      include: this.fullInclude(),
    });
    if (!sb) throw new NotFoundException('Anotador no encontrado');
    // Visibility: owner always; official scoreboards are visible to participants
    // of the tournament + the organiser. For simplicity we allow read to anyone
    // logged in IF it's official; private scoreboards stay owner-only.
    if (sb.isOfficial) return sb;
    if (sb.ownerId !== userId) throw new ForbiddenException('Anotador privado');
    return sb;
  }

  /* ─── UPDATE settings ──────────────────────────────────── */
  async updateSettings(userId: string, id: string, dto: UpdateScoreboardSettingsDto) {
    const sb = await this.assertWritable(userId, id);
    const data: Prisma.ScoreboardUpdateInput = {};
    if (dto.scoringMode) data.scoringMode = dto.scoringMode;
    if (dto.totalSets) data.totalSets = dto.totalSets;
    if (dto.superTieBreak !== undefined) data.superTieBreak = dto.superTieBreak;
    if (dto.gamesPerSet) data.gamesPerSet = dto.gamesPerSet;
    if (dto.homeLabel !== undefined) data.homeLabel = dto.homeLabel;
    if (dto.awayLabel !== undefined) data.awayLabel = dto.awayLabel;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status) data.status = dto.status;

    const updated = await this.prisma.scoreboard.update({
      where: { id },
      data: {
        ...data,
        events: {
          create: {
            authorId: userId,
            action: 'SETTING_CHANGE',
            payload: { changes: dto, before: this.snapshot(sb) } as any,
          },
        },
      },
      include: this.fullInclude(),
    });

    // If the user set status COMPLETED via settings, also sync to tournament
    // (for official scoreboards).
    if (dto.status === 'COMPLETED' && updated.isOfficial && updated.tournamentMatchId) {
      await this.syncToTournament(updated);
    }
    return updated;
  }

  /* ─── AWARD POINT ──────────────────────────────────────── */
  async awardPoint(userId: string, id: string, dto: AwardPointDto) {
    const sb = await this.assertWritable(userId, id);
    if (sb.status === 'COMPLETED') {
      throw new BadRequestException('El partido ya está completado');
    }
    const before = this.snapshot(sb);
    const result = awardPoint(this.toEngineState(sb), dto.side as Side);
    return this.applyAndPersist(userId, id, sb, result.state, before, dto.side === 'HOME' ? 'POINT_HOME' : 'POINT_AWAY');
  }

  /* ─── UNDO last point/setting ─────────────────────────── */
  async undo(userId: string, id: string) {
    const sb = await this.assertWritable(userId, id);
    const lastUndoable = await this.prisma.scoreboardEvent.findFirst({
      where: {
        scoreboardId: id,
        action: { in: ['POINT_HOME', 'POINT_AWAY', 'COPY_FROM_OFFICIAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!lastUndoable) throw new BadRequestException('No hay nada para deshacer');
    const before: any = lastUndoable.payload && (lastUndoable.payload as any).before;
    if (!before) throw new BadRequestException('Evento sin estado anterior');

    const restored = await this.prisma.scoreboard.update({
      where: { id },
      data: {
        ...this.fromSnapshot(before),
        events: {
          create: {
            authorId: userId,
            action: 'UNDO',
            payload: { undoneEventId: lastUndoable.id } as any,
          },
        },
      },
      include: this.fullInclude(),
    });
    return restored;
  }

  /* ─── COPY FROM OFFICIAL (personal mirror) ─────────────── */
  async copyFromOfficial(userId: string, id: string) {
    const mine = await this.assertWritable(userId, id);
    if (!mine.tournamentMatchId) {
      throw new BadRequestException('Este anotador no está vinculado a un torneo');
    }
    const official = await this.prisma.scoreboard.findFirst({
      where: { tournamentMatchId: mine.tournamentMatchId, isOfficial: true },
    });
    if (!official) {
      throw new NotFoundException('No hay anotador oficial todavía');
    }
    const before = this.snapshot(mine);
    const updated = await this.prisma.scoreboard.update({
      where: { id },
      data: {
        ...this.fromSnapshot(this.snapshot(official)),
        // Keep linkage and labels
        homeLabel: mine.homeLabel,
        awayLabel: mine.awayLabel,
        events: {
          create: {
            authorId: userId,
            action: 'COPY_FROM_OFFICIAL',
            payload: { before, sourceId: official.id } as any,
          },
        },
      },
      include: this.fullInclude(),
    });
    return updated;
  }

  /* ─── DELETE ───────────────────────────────────────────── */
  async remove(userId: string, id: string) {
    const sb = await this.prisma.scoreboard.findUnique({ where: { id } });
    if (!sb) throw new NotFoundException();
    if (sb.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.scoreboard.delete({ where: { id } });
    return { ok: true };
  }

  /* ─── EVENTS ───────────────────────────────────────────── */
  async getEvents(userId: string, id: string) {
    const sb = await this.findOne(userId, id);
    return this.prisma.scoreboardEvent.findMany({
      where: { scoreboardId: sb.id },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /* ─── helpers ──────────────────────────────────────────── */

  private async assertWritable(userId: string, id: string) {
    const sb = await this.prisma.scoreboard.findUnique({ where: { id } });
    if (!sb) throw new NotFoundException('Anotador no encontrado');
    // Only the owner can write — even officials are owned by the organiser.
    if (sb.ownerId !== userId) throw new ForbiddenException('No es tu anotador');
    return sb;
  }

  private snapshot(sb: Scoreboard) {
    return {
      currentSet: sb.currentSet,
      homeSetGames: sb.homeSetGames,
      awaySetGames: sb.awaySetGames,
      homePoints: sb.homePoints,
      awayPoints: sb.awayPoints,
      homeAdvantage: sb.homeAdvantage,
      awayAdvantage: sb.awayAdvantage,
      inTieBreak: sb.inTieBreak,
      inSuperTieBreak: sb.inSuperTieBreak,
      homeTbPoints: sb.homeTbPoints,
      awayTbPoints: sb.awayTbPoints,
      servingSide: sb.servingSide,
      status: sb.status,
      winner: sb.winner,
    };
  }

  private fromSnapshot(snap: any): Prisma.ScoreboardUpdateInput {
    return {
      currentSet: snap.currentSet,
      homeSetGames: snap.homeSetGames,
      awaySetGames: snap.awaySetGames,
      homePoints: snap.homePoints,
      awayPoints: snap.awayPoints,
      homeAdvantage: snap.homeAdvantage,
      awayAdvantage: snap.awayAdvantage,
      inTieBreak: snap.inTieBreak,
      inSuperTieBreak: snap.inSuperTieBreak,
      homeTbPoints: snap.homeTbPoints,
      awayTbPoints: snap.awayTbPoints,
      servingSide: snap.servingSide,
      status: snap.status,
      winner: snap.winner,
    };
  }

  private toEngineState(sb: Scoreboard): SbState {
    return {
      scoringMode: sb.scoringMode as any,
      totalSets: sb.totalSets,
      gamesPerSet: sb.gamesPerSet,
      tieBreakAt: sb.tieBreakAt,
      superTieBreak: sb.superTieBreak,
      tieBreakPoints: sb.tieBreakPoints,
      superTieBreakPoints: sb.superTieBreakPoints,
      status: sb.status as any,
      currentSet: sb.currentSet,
      homeSetGames: [...sb.homeSetGames],
      awaySetGames: [...sb.awaySetGames],
      homePoints: sb.homePoints,
      awayPoints: sb.awayPoints,
      homeAdvantage: sb.homeAdvantage,
      awayAdvantage: sb.awayAdvantage,
      inTieBreak: sb.inTieBreak,
      inSuperTieBreak: sb.inSuperTieBreak,
      homeTbPoints: sb.homeTbPoints,
      awayTbPoints: sb.awayTbPoints,
      servingSide: sb.servingSide as Side,
      winner: (sb.winner as Side) || null,
    };
  }

  private async applyAndPersist(
    userId: string,
    id: string,
    before: Scoreboard,
    nextState: SbState,
    beforeSnap: any,
    action: string,
  ) {
    const finished = nextState.status === 'COMPLETED' && !before.finishedAt;
    const updated = await this.prisma.scoreboard.update({
      where: { id },
      data: {
        currentSet: nextState.currentSet,
        homeSetGames: nextState.homeSetGames,
        awaySetGames: nextState.awaySetGames,
        homePoints: nextState.homePoints,
        awayPoints: nextState.awayPoints,
        homeAdvantage: nextState.homeAdvantage,
        awayAdvantage: nextState.awayAdvantage,
        inTieBreak: nextState.inTieBreak,
        inSuperTieBreak: nextState.inSuperTieBreak,
        homeTbPoints: nextState.homeTbPoints,
        awayTbPoints: nextState.awayTbPoints,
        servingSide: nextState.servingSide as ScoreboardSide,
        status: nextState.status as ScoreboardStatus,
        winner: nextState.winner ? (nextState.winner as ScoreboardSide) : null,
        finishedAt: finished ? new Date() : undefined,
        events: {
          create: {
            authorId: userId,
            action,
            payload: { before: beforeSnap } as any,
          },
        },
      },
      include: this.fullInclude(),
    });

    // Auto-sync to tournament when official scoreboard finishes.
    if (finished && updated.isOfficial && updated.tournamentMatchId) {
      await this.syncToTournament(updated);
    }
    return updated;
  }

  private async syncToTournament(sb: Scoreboard) {
    // Replace sets on the linked TournamentMatch with the scoreboard's set games.
    if (!sb.tournamentMatchId) return;
    await this.prisma.tournamentMatchSet.deleteMany({ where: { matchId: sb.tournamentMatchId } });
    const setsToCreate = sb.homeSetGames.map((h, i) => ({
      matchId: sb.tournamentMatchId!,
      setNumber: i + 1,
      homeScore: h,
      awayScore: sb.awaySetGames[i] ?? 0,
    }));
    if (setsToCreate.length > 0) {
      await this.prisma.tournamentMatchSet.createMany({ data: setsToCreate });
    }
    await this.prisma.tournamentMatch.update({
      where: { id: sb.tournamentMatchId },
      data: { status: 'COMPLETED' },
    });
  }

  private fullInclude(): Prisma.ScoreboardInclude {
    return {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      tournamentMatch: {
        select: {
          id: true,
          tournamentId: true,
          tournament: { select: { id: true, name: true } },
        },
      },
      mirrorsScoreboard: { select: { id: true, isOfficial: true } },
    };
  }
}
