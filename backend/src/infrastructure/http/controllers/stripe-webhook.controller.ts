import { Controller, Post, Req, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly stripe: Stripe | null = null;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: any) {
    if (!this.webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // req.rawBody must be available - configure in main.ts
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        this.webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }

    // Process the event
    this.logger.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      // Add other event handlers as needed
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Handle successful payment
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    // TODO: Implement actual payment success handling logic
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Handle failed payment
    this.logger.log(`Payment failed: ${paymentIntent.id}`);
    // TODO: Implement actual payment failure handling logic
  }
}
