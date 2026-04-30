import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
