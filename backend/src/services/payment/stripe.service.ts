import { config } from '@/config';
import type { StripePaymentResponse } from '@/types/payment.types';
import { AppError, ExternalServiceError } from '@/utils/errors';
import logger from '@/utils/logger';
import Stripe from 'stripe';

class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = config.stripe.secretKey;

    if (!secretKey) {
      logger.warn('Stripe credentials not configured');
      throw new ExternalServiceError('stripe configuration missing keys');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  async createCheckoutSession(prams: {
    userId: string;
    packageId: string;
    amount: number;
    credits: number;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, any>;
  }): Promise<StripePaymentResponse> {
    try {
      const sesionConfig: any = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${prams.credits} Headshot credits`,
                description: `Purchase ${prams.credits} credits for $${prams.amount}`,
              },
              unit_amount: Math.round(prams.amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: prams.successUrl,
        cancel_url: prams.cancelUrl,
        metadata: {
          userId: prams.userId,
          packageId: prams.packageId,
          credits: prams.credits.toString(),
          ...prams.metadata,
        },
      };

      if (prams.customerEmail) {
        sesionConfig.customer_email = prams.customerEmail;
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create(sesionConfig);

      logger.info(
        `Stripe checkout session created successfully for user ${prams.userId} and package ${prams.packageId}`,
      );

      return {
        sessionId: session.id,
        redirectUrl: session.url || undefined,
      };
    } catch (error) {
      logger.error(`Error creating Stripe checkout session`, error);
      throw new AppError(
        500,
        'STRIPE_SESSION_ERROR',
        'Failed to create checkout session',
      );
    }
  }

  async parseWebhook(
    rawData: string | Buffer,
    signature: string,
  ): Promise<any> {
    try {
      const webHookSecret = config.stripe.webhookSecretKey;
      if (!webHookSecret) {
        logger.warn('Stripe webhook credentials not configured');
        throw new ExternalServiceError(
          'stripe webhook configuration missing credentials','stripe'
        );
      }
      const event = await this.stripe.webhooks.constructEventAsync(
        rawData,
        signature,
        webHookSecret,
      );
      return event;
    } catch (error) {
      logger.error('stripe webhook event parse failed', error);
      throw new ExternalServiceError('stripe webhook event parse failed','stripe');
    }
  }

  async processStripeWebhook(rawData: string | Buffer, signature: string):Promise<void> {
    try {
      logger.info('Recieved signature', { signature });
      const event = await this.parseWebhook(rawData, signature);
      const session = event.data.object as any;
      logger.info('Webhook event parsed', { type:event.type, data: session});
      
      switch(event.type){
        case 'checkout.session.completed':
          break;
        case 'payment_intent.payment_failed':
          break;
        default:
          logger.info('Unhandled event type received from stripe', { type: event.type });
          break;
      }
      
    } catch (error: any) {
      logger.error('Failed to process stripe webhook', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        'STRIPE_PAYMENT_WEBHOOK_ERROR',
        'Failed to process stripe webhook',
      );
    }
  }
}

export const stripeService = new StripeService();
