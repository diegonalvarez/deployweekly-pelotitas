import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
      },
    });

    // Create WhatsApp log (mock - ready for future integration)
    await this.prisma.whatsAppNotificationLog.create({
      data: {
        notificationId: notification.id,
        channel: 'WHATSAPP',
        templateName: this.getTemplateName(dto.type),
        templateParams: dto.data,
        status: 'PENDING', // Will remain pending until WhatsApp is connected
      },
    });

    return notification;
  }

  async findByUser(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  private getTemplateName(type: NotificationType): string {
    const templates: Record<string, string> = {
      REGISTRATION: 'welcome_message',
      RESERVATION_CREATED: 'reservation_confirmation',
      RESERVATION_CANCELLED: 'reservation_cancellation',
      RESERVATION_REMINDER: 'reservation_reminder',
      CLASS_BOOKED: 'class_booking_confirmation',
      COACH_INVITED: 'coach_invitation',
      COACH_ACCEPTED: 'coach_accepted',
      COACH_REJECTED: 'coach_rejected',
      TOURNAMENT_REGISTERED: 'tournament_registration',
      MATCH_SCHEDULED: 'match_scheduled',
      FIXTURE_CHANGED: 'fixture_update',
      RESULT_UPLOADED: 'result_notification',
      MATCH_INVITATION: 'match_invite',
      CLASS_PRE_APPROVED: 'class_pre_approval',
      CLASS_APPROVED: 'class_approved',
      CONNECTION_REQUEST: 'connection_request',
      CONNECTION_ACCEPTED: 'connection_accepted',
      CONNECTION_REJECTED: 'connection_rejected',
      CLUB_APPROVED: 'club_approved',
      CLUB_REJECTED: 'club_rejected',
      CHALLENGE_RECEIVED: 'challenge_received',
      OTP_CODE: 'otp_code',
      GENERAL: 'general_notification',
    };
    return templates[type] || 'general_notification';
  }
}
