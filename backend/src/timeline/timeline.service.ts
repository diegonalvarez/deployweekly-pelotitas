import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelinePostKind, TimelineMediaKind, TimelineVisibility, TimelineReactionKind } from '@prisma/client';

export type CreatePostInput = {
  body?: string;
  kind?: TimelinePostKind;
  mediaUrl?: string;
  mediaKind?: TimelineMediaKind;
  thumbnailUrl?: string;
  achievementId?: string;
  matchLogId?: string;
  scoreboardId?: string;
  visibility?: TimelineVisibility;
};

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  private postInclude() {
    return {
      owner:     { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      reactions: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      comments:  {
        orderBy: { createdAt: 'asc' as const },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
      _count: { select: { reactions: true, comments: true } },
    };
  }

  async create(ownerId: string, dto: CreatePostInput) {
    if (!dto.body && !dto.mediaUrl && !dto.achievementId && !dto.matchLogId && !dto.scoreboardId) {
      throw new NotFoundException('El post necesita al menos un contenido');
    }
    if (dto.mediaUrl && !/^https?:\/\//.test(dto.mediaUrl)) {
      throw new NotFoundException('mediaUrl inválida');
    }
    return this.prisma.timelinePost.create({
      data: {
        ownerId,
        kind: dto.kind ?? (dto.mediaUrl ? (dto.mediaKind === 'VIDEO' ? 'VIDEO' : 'PHOTO') : 'TEXT'),
        body: dto.body?.slice(0, 600) ?? null,
        mediaUrl: dto.mediaUrl ?? null,
        mediaKind: dto.mediaKind ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        achievementId: dto.achievementId ?? null,
        matchLogId: dto.matchLogId ?? null,
        scoreboardId: dto.scoreboardId ?? null,
        visibility: dto.visibility ?? 'PUBLIC',
      },
      include: this.postInclude(),
    });
  }

  async listForOwner(ownerId: string, viewerId?: string) {
    const isOwner = viewerId === ownerId;
    return this.prisma.timelinePost.findMany({
      where: {
        ownerId,
        ...(isOwner ? {} : { visibility: 'PUBLIC' }),
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: this.postInclude(),
      take: 60,
    });
  }

  async findOnePublic(id: string) {
    const p = await this.prisma.timelinePost.findUnique({
      where: { id },
      include: this.postInclude(),
    });
    if (!p) throw new NotFoundException('Post no encontrado');
    if (p.visibility !== 'PUBLIC') throw new NotFoundException('Post no público');
    return p;
  }

  async remove(userId: string, id: string) {
    const p = await this.prisma.timelinePost.findUnique({ where: { id } });
    if (!p) throw new NotFoundException();
    if (p.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.timelinePost.delete({ where: { id } });
  }

  async react(userId: string, postId: string, kind: TimelineReactionKind) {
    const existing = await this.prisma.timelineReaction.findUnique({
      where: { postId_userId_kind: { postId, userId, kind } },
    });
    if (existing) {
      await this.prisma.timelineReaction.delete({ where: { id: existing.id } });
      return { toggled: 'off' as const };
    }
    await this.prisma.timelineReaction.create({ data: { postId, userId, kind } });
    return { toggled: 'on' as const };
  }

  async comment(userId: string, postId: string, body: string) {
    if (!body?.trim()) throw new NotFoundException('Comentario vacío');
    return this.prisma.timelineComment.create({
      data: { postId, userId, body: body.trim().slice(0, 600) },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const c = await this.prisma.timelineComment.findUnique({ where: { id: commentId } });
    if (!c) throw new NotFoundException();
    if (c.userId !== userId) throw new ForbiddenException();
    return this.prisma.timelineComment.delete({ where: { id: commentId } });
  }

  /** Public profile data — name, avatar, bio, basic stats, ELO. */
  async publicProfile(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, firstName: true, lastName: true, avatarUrl: true,
        playerProfile: {
          select: {
            bio: true, padelLevel: true, tennisLevel: true,
            padelCategory: true, tennisCategory: true,
            showStats: true, showMatchHistory: true, showLevel: true, showCity: true,
            matchesPlayed: true, matchesWon: true,
          },
        },
        eloRatings: { select: { sport: true, rating: true, peakRating: true, matchesCount: true, wins: true, losses: true } },
      },
    });
    if (!u) throw new NotFoundException('Jugador no encontrado');
    return u;
  }
}
