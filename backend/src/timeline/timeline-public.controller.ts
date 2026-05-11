import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('public')
@Controller('public/u')
export class TimelinePublicController {
  constructor(private svc: TimelineService) {}

  @Get(':userId')
  profile(@Param('userId') userId: string) {
    return this.svc.publicProfile(userId);
  }

  @Get(':userId/timeline')
  timeline(@Param('userId') userId: string) {
    return this.svc.listForOwner(userId, undefined);
  }

  @Get('posts/:id')
  post(@Param('id') id: string) {
    return this.svc.findOnePublic(id);
  }
}
