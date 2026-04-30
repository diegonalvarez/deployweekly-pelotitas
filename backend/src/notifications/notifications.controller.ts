import {
  Controller, Get, Patch, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findByUser(userId, unreadOnly === 'true');
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
