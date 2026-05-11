import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { ClubsPublicController } from './clubs-public.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ClubsController, ClubsPublicController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
