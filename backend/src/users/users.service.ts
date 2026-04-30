import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlayerProfileDto, UpdateUserDto } from './dto/update-profile.dto';
import { UpdateAvailabilityDto } from './dto/availability.dto';
import { UpdatePrivacyDto } from './dto/privacy.dto';
import { Sport } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        roles: true,
      },
    });
  }

  async updatePlayerProfile(userId: string, dto: UpdatePlayerProfileDto) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Player profile not found');

    return this.prisma.playerProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        roles: true,
        playerProfile: true,
        coachProfile: {
          include: {
            clubLinks: {
              where: { status: 'ACTIVE' },
              include: { club: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // Respect privacy settings on the player profile
    if (user.playerProfile) {
      const pp = user.playerProfile;
      const sanitized: Record<string, any> = {
        id: pp.id,
        userId: pp.userId,
        bio: pp.bio,
        hand: pp.hand,
        sports: pp.sports,
        preferredPosition: pp.preferredPosition,
        // Always expose privacy flags themselves so the frontend knows what's hidden
        showStats: pp.showStats,
        showMatchHistory: pp.showMatchHistory,
        showLevel: pp.showLevel,
        showCity: pp.showCity,
        showAvailability: pp.showAvailability,
        showTournaments: pp.showTournaments,
        rankingPoints: pp.rankingPoints,
        rankingPosition: pp.rankingPosition,
        createdAt: pp.createdAt,
        updatedAt: pp.updatedAt,
      };

      if (pp.showCity) {
        sanitized.city = pp.city;
        sanitized.state = pp.state;
      }

      if (pp.showStats) {
        sanitized.matchesPlayed = pp.matchesPlayed;
        sanitized.matchesWon = pp.matchesWon;
        sanitized.matchesLost = pp.matchesLost;
        sanitized.setsWon = pp.setsWon;
        sanitized.setsLost = pp.setsLost;
        sanitized.gamesWon = pp.gamesWon;
        sanitized.gamesLost = pp.gamesLost;
      }

      if (pp.showLevel) {
        sanitized.padelLevel = pp.padelLevel;
        sanitized.tennisLevel = pp.tennisLevel;
        sanitized.padelCategory = pp.padelCategory;
        sanitized.tennisCategory = pp.tennisCategory;
      }

      if (pp.showAvailability) {
        sanitized.isAvailableNow = pp.isAvailableNow;
        sanitized.availableUntil = pp.availableUntil;
        sanitized.availableSport = pp.availableSport;
      }

      return { ...user, playerProfile: sanitized };
    }

    return user;
  }

  async searchPlayers(query: {
    city?: string;
    sport?: string;
    minLevel?: number;
    maxLevel?: number;
    page?: number;
    limit?: number;
  }) {
    const { city, sport, minLevel, maxLevel, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { has: 'PLAYER' as const },
      isActive: true,
      playerProfile: {},
    };

    if (city) where.playerProfile.city = { contains: city, mode: 'insensitive' };
    if (sport === 'PADEL' && minLevel) where.playerProfile.padelLevel = { gte: minLevel };
    if (sport === 'PADEL' && maxLevel) where.playerProfile.padelLevel = { ...where.playerProfile.padelLevel, lte: maxLevel };
    if (sport === 'TENNIS' && minLevel) where.playerProfile.tennisLevel = { gte: minLevel };
    if (sport === 'TENNIS' && maxLevel) where.playerProfile.tennisLevel = { ...where.playerProfile.tennisLevel, lte: maxLevel };

    const [players, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          playerProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { players, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ─── RANKING ────────────────────────────────────────────

  async getRanking(query: {
    sport?: string;
    city?: string;
    page?: number;
  }) {
    const { sport, city, page = 1 } = query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { has: 'PLAYER' as const },
      isActive: true,
      playerProfile: {
        showStats: true,
        rankingPoints: { gt: 0 },
      },
    };

    if (city) {
      where.playerProfile.city = { contains: city, mode: 'insensitive' };
    }
    if (sport === 'PADEL' || sport === 'TENNIS') {
      where.playerProfile.sports = { has: sport as Sport };
    }

    const [players, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { playerProfile: { rankingPoints: 'desc' } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          playerProfile: {
            select: {
              rankingPoints: true,
              rankingPosition: true,
              city: true,
              padelLevel: true,
              tennisLevel: true,
              padelCategory: true,
              tennisCategory: true,
              sports: true,
              matchesPlayed: true,
              matchesWon: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { players, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ─── AVAILABILITY ───────────────────────────────────────

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Player profile not found');

    const data: any = {
      isAvailableNow: dto.isAvailableNow,
    };

    if (dto.isAvailableNow) {
      if (dto.availableSport) {
        data.availableSport = dto.availableSport as Sport;
      }
      if (dto.durationMinutes) {
        data.availableUntil = new Date(Date.now() + dto.durationMinutes * 60 * 1000);
      } else {
        data.availableUntil = null;
      }
    } else {
      // Turning off availability: clear the fields
      data.availableUntil = null;
      data.availableSport = null;
    }

    return this.prisma.playerProfile.update({
      where: { userId },
      data,
      select: {
        isAvailableNow: true,
        availableUntil: true,
        availableSport: true,
      },
    });
  }

  async getAvailablePlayers(query: { sport?: string; city?: string }) {
    const { sport, city } = query;
    const now = new Date();

    const where: any = {
      roles: { has: 'PLAYER' as const },
      isActive: true,
      playerProfile: {
        isAvailableNow: true,
        showAvailability: true,
        OR: [
          { availableUntil: null },
          { availableUntil: { gt: now } },
        ],
      },
    };

    if (city) {
      where.playerProfile.city = { contains: city, mode: 'insensitive' };
    }
    if (sport === 'PADEL' || sport === 'TENNIS') {
      where.playerProfile.availableSport = sport as Sport;
    }

    const players = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        playerProfile: {
          select: {
            city: true,
            availableSport: true,
            availableUntil: true,
            padelLevel: true,
            tennisLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { players };
  }

  // ─── PRIVACY ────────────────────────────────────────────

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Player profile not found');

    return this.prisma.playerProfile.update({
      where: { userId },
      data: dto,
      select: {
        showStats: true,
        showMatchHistory: true,
        showLevel: true,
        showCity: true,
        showAvailability: true,
        showTournaments: true,
      },
    });
  }

  // ─── TIMELINE ───────────────────────────────────────────

  async getTimeline(userId: string, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    // Load user with privacy settings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        playerProfile: {
          select: {
            showMatchHistory: true,
            showTournaments: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const privacy = user.playerProfile;

    // Collect activities from different sources in parallel
    const [reservations, matches, tournaments, classes] = await Promise.all([
      // Reservations (always visible)
      this.prisma.reservation.findMany({
        where: { userId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        orderBy: { date: 'desc' },
        take: 50,
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          sport: true,
          status: true,
          court: {
            select: {
              name: true,
              club: { select: { name: true } },
            },
          },
        },
      }),

      // Match participations (respect showMatchHistory)
      privacy?.showMatchHistory !== false
        ? this.prisma.matchParticipant.findMany({
            where: { userId },
            orderBy: { match: { date: 'desc' } },
            take: 50,
            select: {
              team: true,
              match: {
                select: {
                  id: true,
                  date: true,
                  startTime: true,
                  sport: true,
                  status: true,
                  city: true,
                  results: true,
                },
              },
            },
          })
        : [],

      // Tournament participations (respect showTournaments)
      privacy?.showTournaments !== false
        ? this.prisma.tournamentTeamPlayer.findMany({
            where: { userId },
            take: 50,
            select: {
              team: {
                select: {
                  name: true,
                  tournament: {
                    select: {
                      id: true,
                      name: true,
                      sport: true,
                      status: true,
                      startDate: true,
                      club: { select: { name: true } },
                    },
                  },
                },
              },
            },
          })
        : [],

      // Coach bookings (only non-cancelled)
      this.prisma.coachBooking.findMany({
        where: {
          studentId: userId,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        orderBy: { date: 'desc' },
        take: 50,
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          sport: true,
          status: true,
          coach: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    // Normalize into a unified activity list
    type Activity = { type: string; date: Date; data: any };
    const activities: Activity[] = [];

    for (const r of reservations) {
      activities.push({
        type: 'reservation',
        date: r.date,
        data: r,
      });
    }

    for (const mp of matches) {
      activities.push({
        type: 'match',
        date: mp.match.date,
        data: { ...mp.match, team: mp.team },
      });
    }

    for (const tp of tournaments) {
      activities.push({
        type: 'tournament',
        date: tp.team.tournament.startDate ?? new Date(0),
        data: {
          tournamentId: tp.team.tournament.id,
          tournamentName: tp.team.tournament.name,
          sport: tp.team.tournament.sport,
          status: tp.team.tournament.status,
          clubName: tp.team.tournament.club.name,
          teamName: tp.team.name,
          startDate: tp.team.tournament.startDate,
        },
      });
    }

    for (const cb of classes) {
      activities.push({
        type: 'class',
        date: cb.date,
        data: cb,
      });
    }

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = activities.length;
    const paged = activities.slice(skip, skip + limit);

    return { activities: paged, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ─── CALENDAR ───────────────────────────────────────────

  async getCalendar(userId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Fetch all event types in parallel
    const [reservations, coachBookings, matchParticipations, tournamentMatches] =
      await Promise.all([
        // Reservations
        this.prisma.reservation.findMany({
          where: {
            userId,
            date: { gte: fromDate, lte: toDate },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            sport: true,
            status: true,
            court: {
              select: {
                name: true,
                club: { select: { name: true } },
              },
            },
          },
        }),

        // Coach bookings as student
        this.prisma.coachBooking.findMany({
          where: {
            studentId: userId,
            date: { gte: fromDate, lte: toDate },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            sport: true,
            status: true,
            type: true,
            coach: {
              select: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        }),

        // Match participations
        this.prisma.matchParticipant.findMany({
          where: {
            userId,
            match: {
              date: { gte: fromDate, lte: toDate },
              status: { in: ['OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED'] },
            },
          },
          select: {
            match: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                sport: true,
                status: true,
                city: true,
                description: true,
              },
            },
          },
        }),

        // Tournament matches (through teams)
        this.prisma.tournamentMatch.findMany({
          where: {
            scheduledAt: { gte: fromDate, lte: toDate },
            status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
            OR: [
              { homeTeam: { players: { some: { userId } } } },
              { awayTeam: { players: { some: { userId } } } },
            ],
          },
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            tournament: {
              select: { name: true, sport: true },
            },
            homeTeam: { select: { name: true } },
            awayTeam: { select: { name: true } },
            court: {
              select: {
                name: true,
                club: { select: { name: true } },
              },
            },
          },
        }),
      ]);

    type CalendarEvent = {
      type: string;
      date: Date;
      startTime: string;
      endTime: string | null;
      title: string;
      data: any;
    };

    const events: CalendarEvent[] = [];

    for (const r of reservations) {
      events.push({
        type: 'reservation',
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime,
        title: `${r.sport} - ${r.court.club.name} (${r.court.name})`,
        data: r,
      });
    }

    for (const cb of coachBookings) {
      const coachName = `${cb.coach.user.firstName} ${cb.coach.user.lastName}`;
      events.push({
        type: 'class',
        date: cb.date,
        startTime: cb.startTime,
        endTime: cb.endTime,
        title: `Clase con ${coachName}`,
        data: cb,
      });
    }

    for (const mp of matchParticipations) {
      const m = mp.match;
      events.push({
        type: 'match',
        date: m.date,
        startTime: m.startTime,
        endTime: m.endTime ?? null,
        title: `Partido de ${m.sport}${m.city ? ` en ${m.city}` : ''}`,
        data: m,
      });
    }

    for (const tm of tournamentMatches) {
      const home = tm.homeTeam?.name ?? 'TBD';
      const away = tm.awayTeam?.name ?? 'TBD';
      events.push({
        type: 'tournament_match',
        date: tm.scheduledAt!,
        startTime: tm.scheduledAt
          ? tm.scheduledAt.toISOString().substring(11, 16)
          : '',
        endTime: null,
        title: `${tm.tournament.name}: ${home} vs ${away}`,
        data: tm,
      });
    }

    // Sort by date, then startTime
    events.sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return { events };
  }
}
