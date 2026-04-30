import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto, RespondConnectionDto } from './dto/connection.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('connections')
@Controller('connections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private connectionsService: ConnectionsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateConnectionDto,
  ) {
    return this.connectionsService.create(userId, dto);
  }

  @Patch(':id/respond')
  respond(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RespondConnectionDto,
  ) {
    return this.connectionsService.respond(id, userId, dto.action);
  }

  @Get()
  getMyConnections(
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
    @Query('direction') direction?: 'sent' | 'received',
  ) {
    return this.connectionsService.getMyConnections(userId, type, direction);
  }

  @Get('pending')
  getPendingReceived(@CurrentUser('id') userId: string) {
    return this.connectionsService.getPendingReceived(userId);
  }

  @Get('check/:targetUserId')
  async checkConnection(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
  ) {
    const connected = await this.connectionsService.isConnected(userId, targetUserId, type, entityId);
    return { connected };
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.removeConnection(id, userId);
  }
}
