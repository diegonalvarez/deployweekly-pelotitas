import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EloService } from './elo.service';
import { Sport } from '@prisma/client';

@ApiTags('public')
@Controller('public/ranking')
export class EloPublicController {
  constructor(private elo: EloService) {}

  /** GET /api/public/ranking?sport=PADEL&limit=50 */
  @Get()
  async ranking(@Query('sport') sport?: Sport, @Query('limit') limit?: string) {
    const lim = limit ? Math.min(parseInt(limit), 200) : 50;
    if (sport) return this.elo.ranking(sport, lim);
    const [padel, tennis] = await Promise.all([
      this.elo.ranking('PADEL', lim),
      this.elo.ranking('TENNIS', lim),
    ]);
    return { PADEL: padel, TENNIS: tennis };
  }

  /** GET /api/public/ranking/user/:userId */
  @Get('user/:userId')
  async forUser(@Param('userId') userId: string) {
    return this.elo.ratingsForUser(userId);
  }
}
