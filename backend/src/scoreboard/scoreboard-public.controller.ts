import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Public read-only access to completed scoreboards — used to render
 * shareable match cards (e.g. /m/[id]) and Open Graph images.
 *
 * Only returns scoreboards in COMPLETED state, and exposes only fields
 * safe for unauthenticated viewers (no notes, no event log, no ownerId).
 */
@ApiTags('public')
@Controller('public/scoreboards')
export class ScoreboardPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sb = await this.prisma.scoreboard.findUnique({
      where: { id },
      select: {
        id: true,
        isOfficial: true,
        sport: true,
        homeLabel: true,
        awayLabel: true,
        scoringMode: true,
        totalSets: true,
        gamesPerSet: true,
        superTieBreak: true,
        status: true,
        currentSet: true,
        homeSetGames: true,
        awaySetGames: true,
        winner: true,
        finishedAt: true,
        createdAt: true,
        tournamentMatch: {
          select: {
            tournament: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!sb) throw new NotFoundException('Marcador no encontrado');
    if (sb.status !== 'COMPLETED') {
      // Only finished matches are public.
      throw new NotFoundException('Marcador no disponible');
    }
    return sb;
  }
}
