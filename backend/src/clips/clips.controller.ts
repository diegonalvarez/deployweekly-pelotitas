import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClipsService, CreateClipInput } from './clips.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('clips')
@Controller('clips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClipsController {
  constructor(private clips: ClipsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateClipInput) {
    return this.clips.create(userId, dto);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('scoreboardId') scoreboardId: string,
  ) {
    return this.clips.listForScoreboard(userId, scoreboardId);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.clips.remove(userId, id);
  }
}
