import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
