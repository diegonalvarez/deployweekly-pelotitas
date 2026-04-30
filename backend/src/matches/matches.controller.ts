import {
  Controller, Get, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto, RecordResultDto } from './dto/match.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMatchDto,
  ) {
    return this.matchesService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query('sport') sport?: string,
    @Query('city') city?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.matchesService.findAll({
      sport,
      city,
      date,
      status,
      page: page ? parseInt(page) : 1,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyMatches(@CurrentUser('id') userId: string) {
    return this.matchesService.getMyMatches(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  join(
    @Param('id') matchId: string,
    @CurrentUser('id') userId: string,
    @Body('team') team?: number,
  ) {
    return this.matchesService.join(matchId, userId, team);
  }

  @Post(':id/results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  recordResult(
    @Param('id') matchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RecordResultDto,
  ) {
    return this.matchesService.recordResult(matchId, userId, dto);
  }
}
