import { inngest } from '@/lib/inngest.client';
import type { ISuccessfullPayment } from '@/types/payment.types';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';
import { addUserCredits } from './payment.queue';

export interface IAddCreditEventData extends ISuccessfullPayment {
  credits: number;
  userId: string;
}

export async function triggerAddUserCredits(data: IAddCreditEventData) {
  try {
    await inngest.send({
      name: 'payment/add-user-credit',
      data,
    });
    logger.info('Triggered add user credits', { data });
  } catch (error) {
    throw new AppError(
      500,
      'INNGEST_TRIGGER',
      'Failed to trigger add user credits ',
    );
  }
}

export const inngestFunctions = [addUserCredits()];
