import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConnectionDto } from './dto/connection.dto';
import { ConnectionStatus } from '@prisma/client';

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(fromUserId: string, dto: CreateConnectionDto) {
    // Check if connection already exists
    const existing = await this.prisma.connection.findFirst({
      where: {
        fromUserId,
        toUserId: dto.toUserId,
        type: dto.type,
        clubId: dto.clubId || null,
        coachId: dto.coachId || null,
      },
    });
    if (existing) throw new ConflictException('Connection already exists');

    const connection = await this.prisma.connection.create({
      data: {
        fromUserId,
        toUserId: dto.toUserId,
        type: dto.type,
        clubId: dto.clubId,
        coachId: dto.coachId,
        message: dto.message,
      },
    });

    await this.notifications.create({
      userId: dto.toUserId,
      type: 'CONNECTION_REQUEST',
      title: 'Nueva solicitud de conexion',
      message: 'Tienes una nueva solicitud de conexion',
      data: { connectionId: connection.id, type: dto.type },
    });

    return connection;
  }

  async respond(connectionId: string, userId: string, action: 'accept' | 'reject' | 'block') {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.toUserId !== userId) throw new ForbiddenException('Not authorized');

    const statusMap: Record<string, ConnectionStatus> = {
      accept: 'ACCEPTED',
      reject: 'REJECTED',
      block: 'BLOCKED',
    };

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: statusMap[action], respondedAt: new Date() },
    });

    const notifType = action === 'accept' ? 'CONNECTION_ACCEPTED' : 'CONNECTION_REJECTED';
    await this.notifications.create({
      userId: connection.fromUserId,
      type: notifType,
      title: action === 'accept' ? 'Conexion aceptada' : 'Conexion rechazada',
      message: action === 'accept'
        ? 'Tu solicitud de conexion fue aceptada'
        : 'Tu solicitud de conexion fue rechazada',
      data: { connectionId },
    });

    return updated;
  }

  async getMyConnections(userId: string, type?: string, direction?: 'sent' | 'received') {
    const where: any = {};
    if (type) where.type = type;

    if (direction === 'sent') {
      where.fromUserId = userId;
    } else if (direction === 'received') {
      where.toUserId = userId;
    } else {
      where.OR = [{ fromUserId: userId }, { toUserId: userId }];
    }

    return this.prisma.connection.findMany({
      where,
      include: {
        fromUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        toUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingReceived(userId: string) {
    return this.prisma.connection.findMany({
      where: { toUserId: userId, status: 'PENDING' },
      include: {
        fromUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Check if two users are connected for a given type
  async isConnected(userId1: string, userId2: string, type: string, entityId?: string): Promise<boolean> {
    const where: any = {
      status: 'ACCEPTED',
      type,
      OR: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 },
      ],
    };
    if (entityId && type === 'PLAYER_CLUB') where.clubId = entityId;
    if (entityId && type === 'PLAYER_COACH') where.coachId = entityId;
    if (entityId && type === 'ORGANIZER_CLUB') where.clubId = entityId;

    const count = await this.prisma.connection.count({ where });
    return count > 0;
  }

  async removeConnection(connectionId: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.fromUserId !== userId && connection.toUserId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.connection.delete({ where: { id: connectionId } });
  }
}
