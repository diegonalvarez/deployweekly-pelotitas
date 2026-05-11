import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateTournamentDto,
  CreateCategoryDto,
  CreateTeamDto,
  CreateGroupDto,
  GenerateGroupsDto,
  RecordTournamentMatchResultDto,
  OverrideStandingDto,
  GenerateBracketsDto,
  UpdateBracketDto,
} from './dto/tournament.dto';
import { BracketRound } from '@prisma/client';

const FREE_TOURNAMENT_LIMIT = parseInt(process.env.FREE_TOURNAMENTS_PER_OWNER || '5');

@Injectable()
export class TournamentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── TOURNAMENT CRUD ─────────────────────────────────

  async create(userId: string, dto: CreateTournamentDto) {
    const club = await this.prisma.clubProfile.findUnique({
      where: { id: dto.clubId },
    });
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId !== userId) throw new ForbiddenException('Not the club owner');

    // Check free tournament limit
    const tournamentCount = await this.prisma.tournament.count({
      where: { createdById: userId, isFree: true },
    });
    if (tournamentCount >= FREE_TOURNAMENT_LIMIT) {
      throw new BadRequestException(
        `Free tournament limit reached (${FREE_TOURNAMENT_LIMIT}). Upgrade to create more tournaments.`,
      );
    }

    return this.prisma.tournament.create({
      data: {
        clubId: dto.clubId,
        createdById: userId,
        name: dto.name,
        description: dto.description,
        sport: dto.sport,
        maxTeams: dto.maxTeams,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        registrationEnd: dto.registrationEnd ? new Date(dto.registrationEnd) : undefined,
        pointsPerWin: dto.pointsPerWin ?? 3,
        pointsPerLoss: dto.pointsPerLoss ?? 0,
        pointsPerWalkover: dto.pointsPerWalkover ?? 1,
        tiebreakers: dto.tiebreakers || ['POINTS', 'SET_DIFF', 'GAME_DIFF', 'HEAD_TO_HEAD'],
        rules: dto.rules,
        // Match format
        matchBestOf:        dto.matchBestOf        ?? 3,
        matchGamesPerSet:   dto.matchGamesPerSet   ?? 6,
        matchTieBreakAt:    dto.matchTieBreakAt    ?? 6,
        matchTieBreakPts:   dto.matchTieBreakPts   ?? 7,
        matchSuperTbAtLast: dto.matchSuperTbAtLast ?? false,
        matchSuperTbPts:    dto.matchSuperTbPts    ?? 10,
        matchGoldenPoint:   dto.matchGoldenPoint   ?? false,
        matchProSetTo:      dto.matchProSetTo      ?? null,
      },
    });
  }

  async findAll(query: { sport?: string; status?: string; clubId?: string; page?: number }) {
    const { sport, status, clubId, page = 1 } = query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (sport) where.sport = sport;
    if (status) where.status = status;
    if (clubId) where.clubId = clubId;

    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        skip,
        take: limit,
        include: {
          club: { select: { id: true, name: true } },
          _count: { select: { teams: true, groups: true, matches: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tournament.count({ where }),
    ]);

    return { tournaments, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        club: { select: { id: true, name: true, ownerId: true } },
        categories: true,
        teams: {
          include: { players: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        },
        groups: {
          include: {
            members: {
              include: { team: true },
              orderBy: { position: 'asc' },
            },
          },
        },
        brackets: {
          include: {
            homeTeam: true,
            awayTeam: true,
            winner: true,
          },
          orderBy: [{ round: 'asc' }, { position: 'asc' }],
        },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async updateStatus(tournamentId: string, userId: string, status: string) {
    await this.verifyOwner(tournamentId, userId);
    return this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: status as any },
    });
  }

  async getOwnerTournamentCount(userId: string) {
    const count = await this.prisma.tournament.count({
      where: { createdById: userId, isFree: true },
    });
    return { used: count, limit: FREE_TOURNAMENT_LIMIT, remaining: FREE_TOURNAMENT_LIMIT - count };
  }

  // ─── CATEGORIES ──────────────────────────────────────

  async addCategory(tournamentId: string, userId: string, dto: CreateCategoryDto) {
    await this.verifyOwner(tournamentId, userId);
    return this.prisma.tournamentCategory.create({
      data: { tournamentId, ...dto },
    });
  }

  // ─── TEAMS ───────────────────────────────────────────

  async addTeam(tournamentId: string, userId: string, dto: CreateTeamDto) {
    await this.verifyOwner(tournamentId, userId);

    const team = await this.prisma.tournamentTeam.create({
      data: {
        tournamentId,
        name: dto.name,
        categoryId: dto.categoryId,
        seed: dto.seed,
        players: {
          create: dto.playerIds.map(userId => ({ userId })),
        },
      },
      include: { players: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
    });

    // Notify players
    for (const playerId of dto.playerIds) {
      await this.notifications.create({
        userId: playerId,
        type: 'TOURNAMENT_REGISTERED',
        title: 'Inscripción a torneo',
        message: `Fuiste inscripto en el equipo "${dto.name}"`,
        data: { tournamentId, teamId: team.id },
      });
    }

    return team;
  }

  // ─── GROUPS (supports uneven groups) ─────────────────

  async createGroup(tournamentId: string, userId: string, dto: CreateGroupDto) {
    await this.verifyOwner(tournamentId, userId);

    const group = await this.prisma.tournamentGroup.create({
      data: {
        tournamentId,
        name: dto.name,
        categoryId: dto.categoryId,
        qualifyCount: dto.qualifyCount || 2,
        members: {
          create: dto.teamIds.map(teamId => ({ teamId })),
        },
      },
      include: { members: { include: { team: true } } },
    });

    // Auto-generate group stage matches (round-robin)
    await this.generateGroupMatches(tournamentId, group.id);

    return group;
  }

  async generateGroups(tournamentId: string, userId: string, dto: GenerateGroupsDto) {
    await this.verifyOwner(tournamentId, userId);

    const where: any = { tournamentId, isActive: true };
    if (dto.categoryId) where.categoryId = dto.categoryId;

    const teams = await this.prisma.tournamentTeam.findMany({
      where,
      orderBy: { seed: 'asc' },
    });

    if (teams.length < dto.numberOfGroups * 2) {
      throw new BadRequestException('Not enough teams for the requested number of groups');
    }

    // Distribute teams into groups (snake draft for seeding)
    const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const groups: string[][] = Array.from({ length: dto.numberOfGroups }, () => []);

    teams.forEach((team, i) => {
      const round = Math.floor(i / dto.numberOfGroups);
      const idx = round % 2 === 0
        ? i % dto.numberOfGroups
        : dto.numberOfGroups - 1 - (i % dto.numberOfGroups);
      groups[idx].push(team.id);
    });

    // This naturally creates uneven groups when teams don't divide evenly
    const createdGroups: any[] = [];
    for (let i = 0; i < dto.numberOfGroups; i++) {
      const group = await this.prisma.tournamentGroup.create({
        data: {
          tournamentId,
          categoryId: dto.categoryId,
          name: `Zona ${groupNames[i]}`,
          qualifyCount: dto.qualifyPerGroup || 2,
          members: {
            create: groups[i].map(teamId => ({ teamId })),
          },
        },
        include: { members: { include: { team: true } } },
      });

      await this.generateGroupMatches(tournamentId, group.id);
      createdGroups.push(group);
    }

    // Update tournament status
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'GROUP_STAGE' },
    });

    return createdGroups;
  }

  private async generateGroupMatches(tournamentId: string, groupId: string) {
    const members = await this.prisma.tournamentGroupMember.findMany({
      where: { groupId },
    });

    // Round-robin: every team plays every other team
    const matches: any[] = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        matches.push({
          tournamentId,
          groupId,
          homeTeamId: members[i].teamId,
          awayTeamId: members[j].teamId,
          status: 'SCHEDULED' as const,
        });
      }
    }

    if (matches.length > 0) {
      await this.prisma.tournamentMatch.createMany({ data: matches });
    }
  }

  // ─── MATCH RESULTS & STANDINGS ───────────────────────

  async recordMatchResult(
    tournamentId: string,
    matchId: string,
    userId: string,
    dto: RecordTournamentMatchResultDto,
  ) {
    await this.verifyOwner(tournamentId, userId);

    const match = await this.prisma.tournamentMatch.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');

    // Save sets
    await this.prisma.tournamentMatchSet.deleteMany({ where: { matchId } });
    for (const set of dto.sets) {
      await this.prisma.tournamentMatchSet.create({
        data: { matchId, ...set },
      });
    }

    // Determine winner
    let winnerId = dto.winnerId;
    if (!winnerId && !dto.isWalkover) {
      const homeSetsWon = dto.sets.filter(s => s.homeScore > s.awayScore).length;
      const awaySetsWon = dto.sets.filter(s => s.awayScore > s.homeScore).length;
      winnerId = homeSetsWon > awaySetsWon ? match.homeTeamId! : match.awayTeamId!;
    }

    const updatedMatch = await this.prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        winnerId,
        isWalkover: dto.isWalkover || false,
      },
    });

    // Update group standings if this is a group match
    if (match.groupId) {
      await this.recalculateGroupStandings(match.groupId, tournamentId);
    }

    // Update bracket if this is a bracket match
    if (match.bracketId && winnerId) {
      await this.advanceBracketWinner(match.bracketId, winnerId);
    }

    return updatedMatch;
  }

  async recalculateGroupStandings(groupId: string, tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) return;

    const members = await this.prisma.tournamentGroupMember.findMany({
      where: { groupId },
    });

    const matches = await this.prisma.tournamentMatch.findMany({
      where: { groupId, status: 'COMPLETED' },
      include: { sets: true },
    });

    // Reset and recalculate for each member
    for (const member of members) {
      if (member.manualOverride) continue; // Skip manually overridden

      let points = 0, matchesPlayed = 0, matchesWon = 0, matchesLost = 0;
      let setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0;

      for (const match of matches) {
        const isHome = match.homeTeamId === member.teamId;
        const isAway = match.awayTeamId === member.teamId;
        if (!isHome && !isAway) continue;

        matchesPlayed++;
        if (match.winnerId === member.teamId) {
          matchesWon++;
          points += match.isWalkover ? tournament.pointsPerWalkover : tournament.pointsPerWin;
        } else {
          matchesLost++;
          points += tournament.pointsPerLoss;
        }

        for (const set of match.sets) {
          if (isHome) {
            setsWon += set.homeScore > set.awayScore ? 1 : 0;
            setsLost += set.awayScore > set.homeScore ? 1 : 0;
            gamesWon += set.homeScore;
            gamesLost += set.awayScore;
          } else {
            setsWon += set.awayScore > set.homeScore ? 1 : 0;
            setsLost += set.homeScore > set.awayScore ? 1 : 0;
            gamesWon += set.awayScore;
            gamesLost += set.homeScore;
          }
        }
      }

      await this.prisma.tournamentGroupMember.update({
        where: { id: member.id },
        data: { points, matchesPlayed, matchesWon, matchesLost, setsWon, setsLost, gamesWon, gamesLost },
      });
    }

    // Calculate positions based on tiebreakers
    await this.calculatePositions(groupId, tournament.tiebreakers);
  }

  private async calculatePositions(groupId: string, tiebreakers: string[]) {
    const members = await this.prisma.tournamentGroupMember.findMany({
      where: { groupId },
    });

    const group = await this.prisma.tournamentGroup.findUnique({
      where: { id: groupId },
    });

    // Sort by tiebreaker criteria
    const sorted = [...members].sort((a, b) => {
      for (const tb of tiebreakers) {
        let diff = 0;
        switch (tb) {
          case 'POINTS':
            diff = b.points - a.points;
            break;
          case 'SET_DIFF':
            diff = (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
            break;
          case 'GAME_DIFF':
            diff = (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
            break;
          case 'SETS_WON':
            diff = b.setsWon - a.setsWon;
            break;
          case 'GAMES_WON':
            diff = b.gamesWon - a.gamesWon;
            break;
        }
        if (diff !== 0) return diff;
      }
      return 0;
    });

    // Update positions and qualification status
    for (let i = 0; i < sorted.length; i++) {
      const member = sorted[i];
      if (member.manualOverride) continue;

      await this.prisma.tournamentGroupMember.update({
        where: { id: member.id },
        data: {
          position: i + 1,
          isQualified: group ? i < group.qualifyCount : false,
        },
      });
    }
  }

  // ─── MANUAL OVERRIDES ────────────────────────────────

  async overrideStanding(
    tournamentId: string,
    groupId: string,
    userId: string,
    dto: OverrideStandingDto,
  ) {
    await this.verifyOwner(tournamentId, userId);

    const member = await this.prisma.tournamentGroupMember.findUnique({
      where: { groupId_teamId: { groupId, teamId: dto.teamId } },
    });
    if (!member) throw new NotFoundException('Team not in this group');

    return this.prisma.tournamentGroupMember.update({
      where: { id: member.id },
      data: {
        position: dto.position ?? member.position,
        isQualified: dto.isQualified ?? member.isQualified,
        points: dto.points ?? member.points,
        manualOverride: true,
      },
    });
  }

  async finalizeGroup(tournamentId: string, groupId: string, userId: string) {
    await this.verifyOwner(tournamentId, userId);
    return this.prisma.tournamentGroup.update({
      where: { id: groupId },
      data: { isFinalized: true },
    });
  }

  // ─── BRACKETS ────────────────────────────────────────

  async generateBrackets(tournamentId: string, userId: string, dto: GenerateBracketsDto) {
    await this.verifyOwner(tournamentId, userId);

    // Get qualified teams from all groups
    const where: any = {
      group: { tournamentId },
      isQualified: true,
    };
    if (dto.categoryId) {
      where.group = { ...where.group, categoryId: dto.categoryId };
    }

    const qualified = await this.prisma.tournamentGroupMember.findMany({
      where,
      include: { team: true, group: true },
      orderBy: [{ group: { name: 'asc' } }, { position: 'asc' }],
    });

    const teamIds = qualified.map(q => q.teamId);
    const teamCount = teamIds.length;

    if (teamCount < 2) {
      throw new BadRequestException('Need at least 2 qualified teams for brackets');
    }

    // Find next power of 2 for bracket size
    const bracketSize = this.nextPowerOf2(teamCount);
    const byeCount = bracketSize - teamCount;

    // Determine rounds needed
    const rounds = this.getRounds(bracketSize);

    // Delete existing brackets
    await this.prisma.tournamentBracket.deleteMany({
      where: { tournamentId, categoryId: dto.categoryId },
    });

    // Create first-round brackets
    const firstRound = rounds[0];
    const matchesInFirstRound = bracketSize / 2;
    const brackets: any[] = [];

    // Seed teams: 1 vs last, 2 vs second-to-last, etc.
    const seeded = this.seedTeams(teamIds, bracketSize);

    for (let i = 0; i < matchesInFirstRound; i++) {
      const homeTeamId = seeded[i * 2];
      const awayTeamId = seeded[i * 2 + 1];
      const isBye = !homeTeamId || !awayTeamId;

      const bracket = await this.prisma.tournamentBracket.create({
        data: {
          tournamentId,
          categoryId: dto.categoryId,
          round: firstRound,
          position: i + 1,
          homeTeamId: homeTeamId || null,
          awayTeamId: awayTeamId || null,
          isBye,
          winnerId: isBye ? (homeTeamId || awayTeamId) : null,
        },
      });
      brackets.push(bracket);
    }

    // Create subsequent round brackets (empty)
    for (let r = 1; r < rounds.length; r++) {
      const matchesInRound = matchesInFirstRound / Math.pow(2, r);
      for (let i = 0; i < matchesInRound; i++) {
        const bracket = await this.prisma.tournamentBracket.create({
          data: {
            tournamentId,
            categoryId: dto.categoryId,
            round: rounds[r],
            position: i + 1,
          },
        });
        brackets.push(bracket);
      }
    }

    // Create matches for non-bye first-round brackets
    for (const bracket of brackets.filter(b => b.round === firstRound && !b.isBye)) {
      await this.prisma.tournamentMatch.create({
        data: {
          tournamentId,
          bracketId: bracket.id,
          homeTeamId: bracket.homeTeamId,
          awayTeamId: bracket.awayTeamId,
          status: 'SCHEDULED',
        },
      });
    }

    // Advance byes to next round
    for (const bracket of brackets.filter(b => b.isBye && b.winnerId)) {
      await this.advanceBracketWinner(bracket.id, bracket.winnerId);
    }

    // Update tournament status
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'ELIMINATION' },
    });

    return brackets;
  }

  private async advanceBracketWinner(bracketId: string, winnerId: string) {
    const bracket = await this.prisma.tournamentBracket.findUnique({
      where: { id: bracketId },
    });
    if (!bracket) return;

    // Find next round bracket
    const rounds = this.getAllRounds();
    const currentRoundIdx = rounds.indexOf(bracket.round);
    if (currentRoundIdx === -1 || currentRoundIdx >= rounds.length - 1) return;

    const nextRound = rounds[currentRoundIdx + 1];
    const nextPosition = Math.ceil(bracket.position / 2);

    const nextBracket = await this.prisma.tournamentBracket.findFirst({
      where: {
        tournamentId: bracket.tournamentId,
        categoryId: bracket.categoryId,
        round: nextRound,
        position: nextPosition,
      },
    });

    if (!nextBracket) return;

    // Place winner in correct slot (home if from odd position, away if from even)
    const isHome = bracket.position % 2 === 1;
    await this.prisma.tournamentBracket.update({
      where: { id: nextBracket.id },
      data: isHome ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
    });

    // If both teams are set, create a match
    const updated = await this.prisma.tournamentBracket.findUnique({
      where: { id: nextBracket.id },
    });
    if (updated?.homeTeamId && updated?.awayTeamId) {
      await this.prisma.tournamentMatch.create({
        data: {
          tournamentId: bracket.tournamentId,
          bracketId: nextBracket.id,
          homeTeamId: updated.homeTeamId,
          awayTeamId: updated.awayTeamId,
          status: 'SCHEDULED',
        },
      });
    }
  }

  async updateBracket(
    tournamentId: string,
    bracketId: string,
    userId: string,
    dto: UpdateBracketDto,
  ) {
    await this.verifyOwner(tournamentId, userId);
    return this.prisma.tournamentBracket.update({
      where: { id: bracketId },
      data: dto,
    });
  }

  // ─── HELPERS ─────────────────────────────────────────

  private async verifyOwner(tournamentId: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { club: true },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (tournament.club.ownerId !== userId) {
      throw new ForbiddenException('Not the tournament owner');
    }
    return tournament;
  }

  private nextPowerOf2(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  private getRounds(bracketSize: number): BracketRound[] {
    const allRounds: BracketRound[] = [
      'ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16',
      'QUARTERFINAL', 'SEMIFINAL', 'FINAL',
    ];
    const roundSizes = [64, 32, 16, 8, 4, 2];
    const startIdx = roundSizes.findIndex(s => s === bracketSize);
    if (startIdx === -1) {
      // For smaller brackets, start from the appropriate round
      if (bracketSize <= 2) return ['FINAL'];
      if (bracketSize <= 4) return ['SEMIFINAL', 'FINAL'];
      if (bracketSize <= 8) return ['QUARTERFINAL', 'SEMIFINAL', 'FINAL'];
      return allRounds;
    }
    return allRounds.slice(startIdx);
  }

  private getAllRounds(): BracketRound[] {
    return ['ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'];
  }

  private seedTeams(teamIds: string[], bracketSize: number): (string | null)[] {
    const seeded: (string | null)[] = new Array(bracketSize).fill(null);
    // Standard tournament seeding: 1v16, 8v9, 5v12, 4v13, etc.
    for (let i = 0; i < teamIds.length; i++) {
      seeded[i] = teamIds[i];
    }
    return seeded;
  }

  // ─── GROUP MATCHES LISTING ───────────────────────────

  async getGroupMatches(tournamentId: string, groupId: string) {
    return this.prisma.tournamentMatch.findMany({
      where: { tournamentId, groupId },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
        sets: { orderBy: { setNumber: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStandings(tournamentId: string, groupId: string) {
    return this.prisma.tournamentGroupMember.findMany({
      where: { groupId },
      include: { team: true },
      orderBy: { position: 'asc' },
    });
  }
}
