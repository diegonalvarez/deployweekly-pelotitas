import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { MatchLogSide } from '@prisma/client';

/**
 * Public read-only Head-to-Head aggregator between two registered users.
 * Pulls counts from MatchLogEntry where one user was the owner and the
 * other appears as an OPPONENT participant (or vice versa). Detail rows
 * are only included when both users have showMatchHistory = true.
 */
@ApiTags('public')
@Controller('public/h2h')
export class MatchLogPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(':userIdA/vs/:userIdB')
  async h2h(@Param('userIdA') a: string, @Param('userIdB') b: string) {
    if (a === b) throw new NotFoundException('Mismo jugador');

    const [userA, userB] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: a },
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true,
          playerProfile: { select: { showMatchHistory: true, showStats: true } },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: b },
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true,
          playerProfile: { select: { showMatchHistory: true, showStats: true } },
        },
      }),
    ]);
    if (!userA || !userB) throw new NotFoundException('Jugador no encontrado');

    // Find all match-log entries where ownerId in {a,b} AND there's an
    // OPPONENT participant pointing to the other user.
    const entries = await this.prisma.matchLogEntry.findMany({
      where: {
        OR: [
          {
            ownerId: a,
            participants: { some: { side: MatchLogSide.OPPONENT, userId: b } },
          },
          {
            ownerId: b,
            participants: { some: { side: MatchLogSide.OPPONENT, userId: a } },
          },
        ],
      },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        sport: true,
        date: true,
        city: true,
        venue: true,
        myScore: true,
        opponentScore: true,
        result: true,
        ownerId: true,
      },
    });

    // Tally results from A's perspective.
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    for (const e of entries) {
      if (!e.result) continue;
      const ownerIsA = e.ownerId === a;
      if (e.result === 'DRAW') { draws += 1; continue; }
      const ownerWon = e.result === 'WON';
      if ((ownerIsA && ownerWon) || (!ownerIsA && !ownerWon)) winsA += 1;
      else winsB += 1;
    }

    // Detail rows visible only when both users opted in.
    const showDetail =
      (userA.playerProfile?.showMatchHistory ?? true) &&
      (userB.playerProfile?.showMatchHistory ?? true);

    const last5 = showDetail
      ? entries.slice(0, 5).map((e) => {
          const ownerIsA = e.ownerId === a;
          const scoreA = ownerIsA ? e.myScore : e.opponentScore;
          const scoreB = ownerIsA ? e.opponentScore : e.myScore;
          let winner: 'A' | 'B' | 'DRAW' | null = null;
          if (e.result === 'DRAW') winner = 'DRAW';
          else if (e.result === 'WON') winner = ownerIsA ? 'A' : 'B';
          else if (e.result === 'LOST') winner = ownerIsA ? 'B' : 'A';
          return {
            id: e.id,
            sport: e.sport,
            date: e.date,
            city: e.city,
            venue: e.venue,
            scoreA,
            scoreB,
            winner,
          };
        })
      : [];

    return {
      userA: { id: userA.id, firstName: userA.firstName, lastName: userA.lastName, avatarUrl: userA.avatarUrl },
      userB: { id: userB.id, firstName: userB.firstName, lastName: userB.lastName, avatarUrl: userB.avatarUrl },
      total: entries.length,
      winsA,
      winsB,
      draws,
      detailVisible: showDetail,
      last5,
    };
  }
}
