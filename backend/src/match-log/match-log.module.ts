import { Module } from '@nestjs/common';
import { MatchLogController } from './match-log.controller';
import { MatchLogPublicController } from './match-log-public.controller';
import { MatchLogService } from './match-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MatchLogController, MatchLogPublicController],
  providers: [MatchLogService],
  exports: [MatchLogService],
})
export class MatchLogModule {}
