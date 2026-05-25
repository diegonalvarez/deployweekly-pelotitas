import {
  Body, Controller, Get, Param, Patch, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';
import { UpdateLeadDto } from './dto/lead.dto';
import { BrochureLeadStatus } from '@prisma/client';

/** Admin pipeline view for the commercial team. */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN' as any)
@Controller('admin/leads')
export class LeadsAdminController {
  constructor(private leads: LeadsService) {}

  @Get()
  list(
    @Query('status') status?: BrochureLeadStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leads.list({
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 200) : 50,
    });
  }

  @Get('stats')
  stats() {
    return this.leads.stats();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leads.update(id, userId, dto);
  }
}
