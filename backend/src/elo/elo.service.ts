import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchOutcome, Sport } from '@prisma/client';

/**
 * Standard ELO with provisional K-factor.
 *   - Start rating: 1000
 *   - K = 32 while matchesCount < 30 (provisional)
 *   - K = 16 afterwards
 */
const START_RATING = 1000;
const PROVISIONAL_THRESHOLD = 30;
const K_PROVISIONAL = 32;
const K_STANDARD = 16;

function kFactor(matchesCount: number) {
  return matchesCount < PROVISIONAL_THRESHOLD ? K_PROVISIONAL : K_STANDARD;
}

function expectedScore(myRating: number, oppRating: number) {
  return 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
}

/** Outcome from ownerSide perspective → numeric score (0|0.5|1). */
function outcomeToScore(outcome: MatchOutcome): number {
  if (outcome === 'WON') return 1;
  if (outcome === 'LOST') return 0;
  return 0.5;
}

@Injectable()
export class EloService {
  constructor(private prisma: PrismaService) {}

  /** Fetch (or create with start values) the rating row for a user/sport. */
  async getOrInit(userId: string, sport: Sport) {
    return this.prisma.eloRating.upsert({
      where: { userId_sport: { userId, sport } },
      update: {},
      create: { userId, sport, rating: START_RATING, peakRating: START_RATING },
    });
  }

  /**
   * Apply an ELO update for a singles match between userA and userB.
   * Pass the outcome from userA's perspective.
   */
  async applySinglesResult(
    userAId: string,
    userBId: string,
    sport: Sport,
    outcomeForA: MatchOutcome,
    matchedAt: Date = new Date(),
  ) {
    if (userAId === userBId) return;

    const [a, b] = await Promise.all([
      this.getOrInit(userAId, sport),
      this.getOrInit(userBId, sport),
    ]);

    const scoreA = outcomeToScore(outcomeForA);
    const scoreB = 1 - scoreA;
    const expA = expectedScore(a.rating, b.rating);
    const expB = 1 - expA;
    const kA = kFactor(a.matchesCount);
    const kB = kFactor(b.matchesCount);

    const newA = Math.round(a.rating + kA * (scoreA - expA));
    const newB = Math.round(b.rating + kB * (scoreB - expB));

    const isWinA = outcomeForA === 'WON';
    const isWinB = outcomeForA === 'LOST';
    const isDraw = outcomeForA === 'DRAW';

    await this.prisma.$transaction([
      this.prisma.eloRating.update({
        where: { userId_sport: { userId: userAId, sport } },
        data: {
          rating: newA,
          peakRating: Math.max(a.peakRating, newA),
          matchesCount: { increment: 1 },
          wins: { increment: isWinA ? 1 : 0 },
          losses: { increment: isWinB ? 1 : 0 },
          draws: { increment: isDraw ? 1 : 0 },
          lastMatchAt: matchedAt,
        },
      }),
      this.prisma.eloRating.update({
        where: { userId_sport: { userId: userBId, sport } },
        data: {
          rating: newB,
          peakRating: Math.max(b.peakRating, newB),
          matchesCount: { increment: 1 },
          wins: { increment: isWinB ? 1 : 0 },
          losses: { increment: isWinA ? 1 : 0 },
          draws: { increment: isDraw ? 1 : 0 },
          lastMatchAt: matchedAt,
        },
      }),
    ]);

    return { newRatingA: newA, newRatingB: newB, deltaA: newA - a.rating, deltaB: newB - b.rating };
  }

  /** Public ranking for a sport, ordered by rating desc. */
  async ranking(sport: Sport, limit = 50) {
    return this.prisma.eloRating.findMany({
      where: { sport, matchesCount: { gt: 0 } },
      orderBy: [{ rating: 'desc' }, { matchesCount: 'desc' }],
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  /** A user's rating across all sports. */
  async ratingsForUser(userId: string) {
    return this.prisma.eloRating.findMany({
      where: { userId },
      orderBy: { sport: 'asc' },
    });
  }
}
