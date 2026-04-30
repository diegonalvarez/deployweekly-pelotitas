import { Module } from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
  imports: [NotificationsModule, ConnectionsModule],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService],
})
export class CoachesModule {}
