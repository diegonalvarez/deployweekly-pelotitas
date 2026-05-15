import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { CourtsModule } from './courts/courts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { CoachesModule } from './coaches/coaches.module';
import { MatchesModule } from './matches/matches.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConnectionsModule } from './connections/connections.module';
import { AdminModule } from './admin/admin.module';
import { AchievementsModule } from './achievements/achievements.module';
import { FeedModule } from './feed/feed.module';
import { BillingModule } from './billing/billing.module';
import { MatchLogModule } from './match-log/match-log.module';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { EloModule } from './elo/elo.module';
import { PushModule } from './push/push.module';
import { ClipsModule } from './clips/clips.module';
import { TimelineModule } from './timeline/timeline.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute default
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClubsModule,
    CourtsModule,
    ReservationsModule,
    CoachesModule,
    MatchesModule,
    TournamentsModule,
    NotificationsModule,
    ConnectionsModule,
    AdminModule,
    AchievementsModule,
    FeedModule,
    BillingModule,
    MatchLogModule,
    ScoreboardModule,
    EloModule,
    PushModule,
    ClipsModule,
    TimelineModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
