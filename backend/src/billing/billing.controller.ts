import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMine(@CurrentUser('id') userId: string) {
    return this.billing.getSubscription(userId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createCheckout(
    @CurrentUser('id') userId: string,
    @Body() body: { successPath?: string; cancelPath?: string },
  ) {
    return this.billing.createCheckoutSession(userId, body || {});
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  openPortal(@CurrentUser('id') userId: string) {
    return this.billing.createBillingPortalSession(userId);
  }

  /**
   * Stripe webhook endpoint — receives events at /api/billing/webhook.
   * The body is the raw Buffer (set up via main.ts middleware) so we can
   * verify the signature without re-stringifying parsed JSON.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = (req as any).rawBody as Buffer | undefined;
    const payload = raw ?? Buffer.from(JSON.stringify(req.body), 'utf8');
    const event = this.billing.constructEvent(payload, signature);
    await this.billing.handleEvent(event);
    return { received: true };
  }
}
