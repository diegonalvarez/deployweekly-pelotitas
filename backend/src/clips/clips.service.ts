import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClipVisibility } from '@prisma/client';

export type CreateClipInput = {
  scoreboardId?: string;
  url: string;
  mimeType?: string;
  posterUrl?: string;
  durationMs?: number;
  matchOffsetMs?: number;
  label?: string;
  visibility?: ClipVisibility;
};

@Injectable()
export class ClipsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateClipInput) {
    if (!dto.url || !/^https?:\/\//.test(dto.url)) {
      throw new NotFoundException('URL del clip inválida');
    }
    return this.prisma.matchClip.create({
      data: {
        ownerId,
        scoreboardId: dto.scoreboardId ?? null,
        url: dto.url,
        mimeType: dto.mimeType ?? null,
        posterUrl: dto.posterUrl ?? null,
        durationMs: dto.durationMs ?? null,
        matchOffsetMs: dto.matchOffsetMs ?? null,
        label: dto.label ?? null,
        visibility: dto.visibility ?? 'PRIVATE',
      },
    });
  }

  async listForScoreboard(userId: string, scoreboardId: string) {
    const sb = await this.prisma.scoreboard.findUnique({
      where: { id: scoreboardId },
      select: { id: true, ownerId: true, isOfficial: true, status: true },
    });
    if (!sb) throw new NotFoundException('Scoreboard no encontrado');
    const canSeePrivate = sb.ownerId === userId;
    return this.prisma.matchClip.findMany({
      where: {
        scoreboardId,
        ...(canSeePrivate ? {} : { visibility: 'PUBLIC' }),
      },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async remove(userId: string, id: string) {
    const clip = await this.prisma.matchClip.findUnique({ where: { id } });
    if (!clip) throw new NotFoundException('Clip no encontrado');
    if (clip.ownerId !== userId) throw new ForbiddenException('No es tu clip');
    return this.prisma.matchClip.delete({ where: { id } });
  }
}
