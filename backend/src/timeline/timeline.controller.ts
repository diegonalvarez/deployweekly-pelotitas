import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TimelineService, CreatePostInput } from './timeline.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TimelineReactionKind } from '@prisma/client';

@ApiTags('timeline')
@Controller('timeline')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private svc: TimelineService) {}

  @Post('posts')
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePostInput) {
    return this.svc.create(userId, dto);
  }

  @Get('me')
  mine(@CurrentUser('id') userId: string) {
    return this.svc.listForOwner(userId, userId);
  }

  @Delete('posts/:id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.svc.remove(userId, id);
  }

  @Post('posts/:id/react')
  react(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
    @Body() body: { kind?: TimelineReactionKind },
  ) {
    return this.svc.react(userId, postId, body?.kind ?? 'FIRE');
  }

  @Post('posts/:id/comments')
  comment(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
    @Body() body: { body: string },
  ) {
    return this.svc.comment(userId, postId, body?.body || '');
  }

  @Delete('comments/:id')
  deleteComment(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.svc.deleteComment(userId, id);
  }
}
