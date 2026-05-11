import { Module } from '@nestjs/common';
import { MatchLogController } from './match-log.controller';
import { MatchLogPublicController } from './match-log-public.controller';
import { MatchLogService } from './match-log.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EloModule } from '../elo/elo.module';

@Module({
  imports: [PrismaModule, EloModule],
  controllers: [MatchLogController, MatchLogPublicController],
  providers: [MatchLogService],
  exports: [MatchLogService],
})
export class MatchLogModule {}
