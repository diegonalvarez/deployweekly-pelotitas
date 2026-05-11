import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { TimelinePublicController } from './timeline-public.controller';
import { TimelineService } from './timeline.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimelineController, TimelinePublicController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
