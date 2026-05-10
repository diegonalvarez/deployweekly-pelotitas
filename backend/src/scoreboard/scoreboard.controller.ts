import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScoreboardService } from './scoreboard.service';
import {
  AwardPointDto,
  CreateScoreboardDto,
  UpdateScoreboardSettingsDto,
} from './dto/scoreboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScoreboardStatus } from '@prisma/client';

@ApiTags('scoreboards')
@Controller('scoreboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScoreboardController {
  constructor(private service: ScoreboardService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateScoreboardDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  findMine(@CurrentUser('id') userId: string, @Query('status') status?: ScoreboardStatus) {
    return this.service.findMine(userId, { status });
  }

  @Get('by-tournament-match/:tournamentMatchId')
  findByTournamentMatch(
    @CurrentUser('id') userId: string,
    @Param('tournamentMatchId') tournamentMatchId: string,
  ) {
    return this.service.findByTournamentMatch(userId, tournamentMatchId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Get(':id/events')
  events(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.getEvents(userId, id);
  }

  @Patch(':id/settings')
  updateSettings(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScoreboardSettingsDto,
  ) {
    return this.service.updateSettings(userId, id, dto);
  }

  @Post(':id/point')
  awardPoint(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AwardPointDto,
  ) {
    return this.service.awardPoint(userId, id, dto);
  }

  @Post(':id/undo')
  undo(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.undo(userId, id);
  }

  @Post(':id/copy-from-official')
  copyFromOfficial(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.copyFromOfficial(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
