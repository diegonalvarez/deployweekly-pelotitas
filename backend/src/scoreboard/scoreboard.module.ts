import { Module } from '@nestjs/common';
import { ScoreboardController } from './scoreboard.controller';
import { ScoreboardPublicController } from './scoreboard-public.controller';
import { ScoreboardService } from './scoreboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScoreboardController, ScoreboardPublicController],
  providers: [ScoreboardService],
  exports: [ScoreboardService],
})
export class ScoreboardModule {}
