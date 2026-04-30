import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  getPublicFeed(@Query('page') page?: string) {
    return this.feedService.getPublicFeed(page ? parseInt(page) : 1);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyFeed(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
  ) {
    return this.feedService.getMyFeed(userId, page ? parseInt(page) : 1);
  }
}
