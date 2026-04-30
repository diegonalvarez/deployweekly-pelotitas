import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyAchievements(@CurrentUser('id') userId: string) {
    return this.achievementsService.getMyAchievements(userId);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('page') page?: string) {
    return this.achievementsService.getLeaderboardByXP(
      page ? parseInt(page) : 1,
    );
  }
}
