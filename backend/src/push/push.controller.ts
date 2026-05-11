import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DevicePlatform } from '@prisma/client';

@ApiTags('push')
@Controller('push')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PushController {
  constructor(private push: PushService) {}

  @Post('register')
  register(
    @CurrentUser('id') userId: string,
    @Body() body: { platform: DevicePlatform; token: string; appVersion?: string },
  ) {
    if (!body?.token) {
      return { error: 'token required' };
    }
    return this.push.register(userId, body.platform, body.token, body.appVersion);
  }

  @Delete('tokens/:token')
  revoke(@CurrentUser('id') userId: string, @Param('token') token: string) {
    return this.push.revoke(userId, decodeURIComponent(token));
  }
}
