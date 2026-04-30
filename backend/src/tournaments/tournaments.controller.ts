import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import {
  CreateTournamentDto,
  CreateCategoryDto,
  CreateTeamDto,
  CreateGroupDto,
  GenerateGroupsDto,
  RecordTournamentMatchResultDto,
  OverrideStandingDto,
  GenerateBracketsDto,
  UpdateBracketDto,
} from './dto/tournament.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentsService: TournamentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTournamentDto,
  ) {
    return this.tournamentsService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query('sport') sport?: string,
    @Query('status') status?: string,
    @Query('clubId') clubId?: string,
    @Query('page') page?: string,
  ) {
    return this.tournamentsService.findAll({
      sport, status, clubId, page: page ? parseInt(page) : 1,
    });
  }

  @Get('my-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyCount(@CurrentUser('id') userId: string) {
    return this.tournamentsService.getOwnerTournamentCount(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: string,
  ) {
    return this.tournamentsService.updateStatus(id, userId, status);
  }

  // Categories
  @Post(':id/categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addCategory(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.tournamentsService.addCategory(id, userId, dto);
  }

  // Teams
  @Post(':id/teams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addTeam(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTeamDto,
  ) {
    return this.tournamentsService.addTeam(id, userId, dto);
  }

  // Groups
  @Post(':id/groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createGroup(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.tournamentsService.createGroup(id, userId, dto);
  }

  @Post(':id/generate-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generateGroups(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateGroupsDto,
  ) {
    return this.tournamentsService.generateGroups(id, userId, dto);
  }

  // Matches & Results
  @Get(':id/groups/:groupId/matches')
  getGroupMatches(
    @Param('id') tournamentId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.tournamentsService.getGroupMatches(tournamentId, groupId);
  }

  @Post(':id/matches/:matchId/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  recordResult(
    @Param('id') tournamentId: string,
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RecordTournamentMatchResultDto,
  ) {
    return this.tournamentsService.recordMatchResult(tournamentId, matchId, userId, dto);
  }

  // Standings
  @Get(':id/groups/:groupId/standings')
  getStandings(
    @Param('id') tournamentId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.tournamentsService.getStandings(tournamentId, groupId);
  }

  @Patch(':id/groups/:groupId/standings/override')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  overrideStanding(
    @Param('id') tournamentId: string,
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: OverrideStandingDto,
  ) {
    return this.tournamentsService.overrideStanding(tournamentId, groupId, userId, dto);
  }

  @Patch(':id/groups/:groupId/finalize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  finalizeGroup(
    @Param('id') tournamentId: string,
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tournamentsService.finalizeGroup(tournamentId, groupId, userId);
  }

  // Brackets
  @Post(':id/brackets/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  generateBrackets(
    @Param('id') tournamentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateBracketsDto,
  ) {
    return this.tournamentsService.generateBrackets(tournamentId, userId, dto);
  }

  @Patch(':id/brackets/:bracketId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateBracket(
    @Param('id') tournamentId: string,
    @Param('bracketId') bracketId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBracketDto,
  ) {
    return this.tournamentsService.updateBracket(tournamentId, bracketId, userId, dto);
  }
}
