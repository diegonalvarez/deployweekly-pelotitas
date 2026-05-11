import { Module } from '@nestjs/common';
import { EloService } from './elo.service';
import { EloPublicController } from './elo-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EloPublicController],
  providers: [EloService],
  exports: [EloService],
})
export class EloModule {}
