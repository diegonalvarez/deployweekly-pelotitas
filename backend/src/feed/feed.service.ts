import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async createFeedItem(
    userId: string,
    type: string,
    title: string,
    content?: string,
    metadata?: any,
  ) {
    return this.prisma.activityFeedItem.create({
      data: {
        userId,
        type,
        title,
        content,
        metadata,
        isPublic: true,
      },
    });
  }

  async getPublicFeed(page: number = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityFeedItem.count({ where: { isPublic: true } }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyFeed(userId: string, page: number = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityFeedItem.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
