import { paymentService } from '@/services/payment/payment.service';
import { BadRequestError } from '@/utils/errors';
import { successResponse } from '@/utils/responses';
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
  const { packageId, userId, platform, phone, cancelUrl, successUrl } =
    req.body;

  const paymentResponse = await paymentService.processPayment({
    packageId,
    userId,
    cancelUrl,
    platform,
    successUrl,
    phone,
  });

  return successResponse(res, paymentResponse.message, 200, paymentResponse);
}
