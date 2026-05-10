import { Module } from '@nestjs/common';
import { MatchLogController } from './match-log.controller';
import { MatchLogService } from './match-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MatchLogController],
  providers: [MatchLogService],
  exports: [MatchLogService],
})
export class MatchLogModule {}
