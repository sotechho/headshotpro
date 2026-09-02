import { paymentService } from '@/services/payment/payment.service';
import { stripeService } from '@/services/payment/stripe.service';
import {
  BadRequestError,
  ExternalServiceError,
  NotFoundError,
} from '@/utils/errors';
import logger from '@/utils/logger';
import { errorResponse, successResponse } from '@/utils/responses';
import type { Request, Response } from 'express';

export async function getCreditPackages(req: Request, res: Response) {
  const credits = await paymentService.getCreditPackages();
  return successResponse(res, 'Credits fetched', 200, credits);
}

export async function getCreditPackageById(req: Request, res: Response) {
  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new BadRequestError('Invalid package id');
  }

  const creditPackage = await paymentService.getCreditPackageById(id);
  return successResponse(res, 'Credit package fetched', 200, creditPackage);
}

export async function processPayment(req: Request, res: Response) {
  const userId = req.user?.userId;

  if (!userId) {
    throw new NotFoundError('User is required');
  }

  const { packageId, platform, phone, cancelUrl, successUrl } = req.body;

  const paymentResponse = await paymentService.processPayment({
    packageId,
    userId,
    cancelUrl,
    platform,
    successUrl,
    phone,
  });

  if (!paymentResponse.success) {
    return errorResponse(
      res,
      400,
      paymentResponse.message,
      paymentResponse.error || {},
    );
  }

  return successResponse(res, paymentResponse.message, 200, paymentResponse);
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  logger.info('Webhook recieved');
  const signature: string = req.headers['stripe-signature'] as string;
  if (!signature) {
    logger.error('Stripe signature not found');
    throw new ExternalServiceError('Stripe signature not found', 'stripe');
  }
  await stripeService.processStripeWebhook(req.body, signature);
  return successResponse(res, 'Webhook successfully recieved');
}

export async function getPaymentOrders(req: Request, res: Response) {
  const userId = req.user?.userId;

  if (!userId) {
    throw new NotFoundError('User is required');
  }

  const limit = (req.query.limit as string) || 10;

  const orders = await paymentService.orders(Number(limit)); // Adjust limit as needed
  return successResponse(res, 'Payment history fetched', 200, orders);
}

export async function getOrderById(req: Request, res: Response) {
  const { id } = req.params;
  const order = await paymentService.getOrderById(id as string);
  return successResponse(res, 'Order fetched', 200, order);
}
