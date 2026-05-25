import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/lead.dto';

/** Public lead intake — used by brochure.pelotitas.com. */
@ApiTags('public')
@Controller('public/leads')
export class LeadsPublicController {
  constructor(private leads: LeadsService) {}

  @Post()
  // Tighten the throttle so a bot can't fill the table from one IP.
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  create(
    @Body() dto: CreateLeadDto,
    @Headers('user-agent') ua: string,
    @Headers('referer') referer: string,
    @Ip() ip: string,
  ) {
    return this.leads.create({
      ...dto,
      source: dto.source ?? 'brochure',
      userAgent: ua,
      referrer: referer,
      ipAddress: ip,
    });
  }
}
