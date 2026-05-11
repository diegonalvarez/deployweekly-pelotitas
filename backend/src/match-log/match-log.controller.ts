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
import { MatchLogService } from './match-log.service';
import { CreateMatchLogDto, UpdateMatchLogDto } from './dto/match-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Sport } from '@prisma/client';

@ApiTags('match-log')
@Controller('match-log')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchLogController {
  constructor(private service: MatchLogService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateMatchLogDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  findMine(
    @CurrentUser('id') userId: string,
    @Query('sport') sport?: Sport,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('opponent') opponent?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findMine(userId, {
      sport,
      from,
      to,
      opponent,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('opponent')
  opponentHistory(
    @CurrentUser('id') userId: string,
    @Query('opponentUserId') opponentUserId?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
  ) {
    return this.service.opponentHistory(userId, { opponentUserId, firstName, lastName });
  }

  @Get('phantom-mentions')
  phantomMentions(@CurrentUser('id') userId: string) {
    return this.service.findPhantomMentions(userId);
  }

  @Get('rivalries')
  rivalries(
    @CurrentUser('id') userId: string,
    @Query('threshold') threshold?: string,
  ) {
    return this.service.myRivalries(userId, threshold ? parseInt(threshold) : 3);
  }

  @Post('phantom-mentions/claim')
  claimPhantomMentions(
    @CurrentUser('id') userId: string,
    @Body('participantIds') participantIds: string[],
  ) {
    return this.service.claimPhantomMentions(userId, participantIds || []);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMatchLogDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
