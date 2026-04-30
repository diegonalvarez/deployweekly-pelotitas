import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ACHIEVEMENT_DEFINITIONS = [
  { key: 'first_reservation', name: 'Primera reserva', description: 'Hiciste tu primera reserva', iconEmoji: '\uD83C\uDFAF', xpReward: 10, category: 'milestone' },
  { key: 'first_match', name: 'Primer partido', description: 'Jugaste tu primer partido', iconEmoji: '\u26A1', xpReward: 15, category: 'milestone' },
  { key: '10_matches', name: '10 partidos', description: 'Jugaste 10 partidos', iconEmoji: '\uD83D\uDD25', xpReward: 50, category: 'milestone' },
  { key: 'first_tournament', name: 'Primer torneo', description: 'Participaste en tu primer torneo', iconEmoji: '\uD83C\uDFC6', xpReward: 25, category: 'tournament' },
  { key: 'tournament_champion', name: 'Campeon!', description: 'Ganaste un torneo', iconEmoji: '\uD83D\uDC51', xpReward: 100, category: 'tournament' },
  { key: '5_wins_streak', name: 'Racha de 5', description: 'Ganaste 5 partidos seguidos', iconEmoji: '\uD83D\uDCAA', xpReward: 75, category: 'milestone' },
  { key: 'connected_10', name: 'Red de 10', description: 'Conectaste con 10 usuarios', iconEmoji: '\uD83E\uDD1D', xpReward: 30, category: 'social' },
  { key: 'first_class', name: 'Primera clase', description: 'Tomaste tu primera clase', iconEmoji: '\uD83C\uDF93', xpReward: 15, category: 'training' },
  { key: 'night_owl', name: 'Nocturno', description: 'Reservaste despues de las 21:00', iconEmoji: '\uD83E\uDD89', xpReward: 10, category: 'general' },
  { key: 'early_bird', name: 'Madrugador', description: 'Reservaste antes de las 9:00', iconEmoji: '\uD83C\uDF05', xpReward: 10, category: 'general' },
];

export { ACHIEVEMENT_DEFINITIONS };

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async checkAndAward(
    userId: string,
    context: {
      type: string;
      reservationTime?: string;
    },
  ) {
    const awarded: string[] = [];

    const tryAward = async (key: string) => {
      const achievement = await this.prisma.achievement.findUnique({ where: { key } });
      if (!achievement) return;

      const existing = await this.prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      });
      if (existing) return;

      await this.prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { xpPoints: { increment: achievement.xpReward } },
      });

      awarded.push(key);
    };

    if (context.type === 'reservation') {
      // First reservation
      const reservationCount = await this.prisma.reservation.count({ where: { userId } });
      if (reservationCount >= 1) {
        await tryAward('first_reservation');
      }

      // Night owl / Early bird
      if (context.reservationTime) {
        const hour = parseInt(context.reservationTime.split(':')[0], 10);
        if (hour >= 21) await tryAward('night_owl');
        if (hour < 9) await tryAward('early_bird');
      }
    }

    if (context.type === 'match') {
      const matchCount = await this.prisma.matchParticipant.count({ where: { userId } });
      if (matchCount >= 1) await tryAward('first_match');
      if (matchCount >= 10) await tryAward('10_matches');
    }

    if (context.type === 'tournament') {
      const tournamentCount = await this.prisma.tournamentTeamPlayer.count({ where: { userId } });
      if (tournamentCount >= 1) await tryAward('first_tournament');
    }

    if (context.type === 'tournament_win') {
      await tryAward('tournament_champion');
    }

    if (context.type === 'connection') {
      const connectionCount = await this.prisma.connection.count({
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
          status: 'ACCEPTED',
        },
      });
      if (connectionCount >= 10) await tryAward('connected_10');
    }

    if (context.type === 'class') {
      const classCount = await this.prisma.coachBooking.count({
        where: { studentId: userId },
      });
      if (classCount >= 1) await tryAward('first_class');
    }

    return awarded;
  }

  async getMyAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async getLeaderboardByXP(page: number = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { xpPoints: { gt: 0 } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          xpPoints: true,
          _count: { select: { achievements: true } },
        },
        orderBy: { xpPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { xpPoints: { gt: 0 } } }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
