import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import StripeLib = require('stripe');
type Stripe = StripeLib.Stripe; // class type for the Stripe SDK client instance

// Stripe namespace (Event, Subscription, Checkout, …) — sidestep the CJS
// d.ts namespace-vs-type ambiguity by importing it directly from stripe.core.
import type { Stripe as StripeNS } from 'stripe/cjs/stripe.core.js';
type StripeClient = StripeNS;
type StripeEvent = StripeNS.Event;
type StripeSubscription = StripeNS.Subscription;
type StripeSubscriptionStatus = StripeNS.Subscription.Status;
type StripeCheckoutSession = StripeNS.Checkout.Session;

/* ─────────────────────────────────────────────────────────────
   BillingService — wraps Stripe calls + subscription state.
   Designed to degrade gracefully when STRIPE_SECRET_KEY is
   missing (dev environments without billing): all calls return
   sensible "not configured" responses instead of crashing.
   ───────────────────────────────────────────────────────────── */

const STRIPE_API_VERSION = '2024-09-30.acacia' as const;

@Injectable()
export class BillingService implements OnModuleInit {
  private readonly logger = new Logger(BillingService.name);
  private stripe: StripeClient | null = null;
  private priceId: string | null = null;
  private webhookSecret: string | null = null;
  private appUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.appUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3098';
  }

  onModuleInit() {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    this.priceId = this.config.get<string>('STRIPE_PRICE_ID') || null;
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || null;

    if (!secret) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — billing endpoints will return "not configured" responses.',
      );
      return;
    }
    this.stripe = new StripeLib(secret, { apiVersion: STRIPE_API_VERSION as any });
    this.logger.log('Stripe client initialised.');
    if (!this.priceId) {
      this.logger.warn('STRIPE_PRICE_ID not set — checkout will refuse until configured.');
    }
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set — webhook signature verification disabled (DEV ONLY).');
    }
  }

  /* ── Public state-checking helpers ─────────────────────── */

  isConfigured(): boolean {
    return this.stripe !== null && this.priceId !== null;
  }

  /** Return the user's subscription augmented with computed flags.  */
  async getSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return this.serialize(sub);
  }

  /** Returns true if the user has an entitlement to "Pro" features. */
  async hasActiveEntitlement(userId: string): Promise<boolean> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return this.isEntitled(sub);
  }

  /* ── Stripe interactions ──────────────────────────────── */

  async createCheckoutSession(userId: string, opts: { successPath?: string; cancelPath?: string } = {}) {
    if (!this.stripe || !this.priceId) {
      throw new BadRequestException('Billing is not configured on the server.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Make sure we have a Stripe customer for this user — reused across checkouts.
    let customerId = (await this.prisma.subscription.findUnique({ where: { userId } }))?.stripeCustomerId
      || null;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      // Pre-create the Subscription row so future webhook lookups find it.
      await this.prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: { userId, stripeCustomerId: customerId, status: SubscriptionStatus.INACTIVE },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: `${this.appUrl}${opts.successPath || '/billing?status=success'}`,
      cancel_url:  `${this.appUrl}${opts.cancelPath  || '/billing?status=cancelled'}`,
      allow_promotion_codes: true,
      // Saves payment method for future renewals.
      payment_method_collection: 'always',
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });

    return { url: session.url, id: session.id };
  }

  async createBillingPortalSession(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Billing is not configured on the server.');
    }
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer for this user yet — start a subscription first.');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${this.appUrl}/billing`,
    });
    return { url: session.url };
  }

  /* ── Webhook ───────────────────────────────────────────── */

  /** Verifies signature (when secret configured) and returns the parsed event. */
  constructEvent(payload: Buffer | string, signature: string | string[] | undefined): StripeEvent {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    const sig = Array.isArray(signature) ? signature[0] : signature;
    if (!this.webhookSecret) {
      // DEV ONLY: trust unsigned payload. Real environments must set STRIPE_WEBHOOK_SECRET.
      this.logger.warn('Webhook signature NOT verified — set STRIPE_WEBHOOK_SECRET in production.');
      return JSON.parse(typeof payload === 'string' ? payload : payload.toString('utf8')) as StripeEvent;
    }
    if (!sig) throw new BadRequestException('Missing Stripe-Signature header');
    return this.stripe.webhooks.constructEvent(payload, sig, this.webhookSecret);
  }

  async handleEvent(event: StripeEvent): Promise<void> {
    this.logger.log(`Stripe event: ${event.type}`);
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession;
        if (session.mode !== 'subscription' || !session.subscription) break;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        await this.syncSubscriptionFromStripe(subId);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as StripeSubscription;
        await this.syncSubscriptionFromStripe(sub.id, sub);
        break;
      }
      default:
        this.logger.debug(`Ignored event type: ${event.type}`);
    }
  }

  /* ── Helpers ───────────────────────────────────────────── */

  private async syncSubscriptionFromStripe(subId: string, prefetched?: StripeSubscription) {
    if (!this.stripe) return;
    const sub = prefetched ?? (await this.stripe.subscriptions.retrieve(subId));
    const userId = (sub.metadata && sub.metadata.userId) || null;
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    // Resolve userId: either via metadata, or by looking up Subscription row by stripeCustomerId.
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const existing = await this.prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });
      resolvedUserId = existing?.userId || null;
    }
    if (!resolvedUserId) {
      this.logger.warn(`Could not resolve userId for Stripe subscription ${sub.id}`);
      return;
    }

    const item = sub.items.data[0];
    const priceId = item?.price?.id;

    await this.prisma.subscription.upsert({
      where: { userId: resolvedUserId },
      create: {
        userId: resolvedUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        status: this.mapStatus(sub.status),
        currentPeriodStart: this.toDate((sub as any).current_period_start ?? item?.current_period_start),
        currentPeriodEnd:   this.toDate((sub as any).current_period_end   ?? item?.current_period_end),
        cancelAtPeriodEnd:  sub.cancel_at_period_end,
        canceledAt:         this.toDate(sub.canceled_at),
        trialEnd:           this.toDate(sub.trial_end),
        plan:               'pro',
      },
      update: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        status: this.mapStatus(sub.status),
        currentPeriodStart: this.toDate((sub as any).current_period_start ?? item?.current_period_start),
        currentPeriodEnd:   this.toDate((sub as any).current_period_end   ?? item?.current_period_end),
        cancelAtPeriodEnd:  sub.cancel_at_period_end,
        canceledAt:         this.toDate(sub.canceled_at),
        trialEnd:           this.toDate(sub.trial_end),
        plan:               'pro',
      },
    });
  }

  private mapStatus(s: StripeSubscriptionStatus): SubscriptionStatus {
    const m: Record<StripeSubscriptionStatus, SubscriptionStatus> = {
      trialing: SubscriptionStatus.TRIALING,
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      unpaid: SubscriptionStatus.UNPAID,
      paused: SubscriptionStatus.INACTIVE,
    };
    return m[s] ?? SubscriptionStatus.INACTIVE;
  }

  private toDate(unix: number | null | undefined): Date | undefined {
    return typeof unix === 'number' ? new Date(unix * 1000) : undefined;
  }

  private isEntitled(sub: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null): boolean {
    if (!sub) return false;
    if (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.TRIALING) return false;
    if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return false;
    return true;
  }

  private serialize(sub: any) {
    if (!sub) {
      return {
        isActive: false,
        status: 'INACTIVE',
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        configured: this.isConfigured(),
      };
    }
    return {
      isActive: this.isEntitled(sub),
      status: sub.status,
      plan: sub.plan,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      configured: this.isConfigured(),
    };
  }
}
