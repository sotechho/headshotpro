import { inngest } from '@/lib/inngest.client';
import type { ISuccessfullPayment } from '@/types/payment.types';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';
import type { HeadshotStyle } from '../headshot';

export interface IAddCreditEventData extends ISuccessfullPayment {
  credits: number;
  userId: string;
}

export interface IGenerateHeadshotEventData {
  userId:string;
  headshotId:string;
  photoUrl:string;
  selectedStyles?:HeadshotStyle[]
  customPrompt?:string
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

export async function triggerGenerateHeadshots(data:IGenerateHeadshotEventData){
  try {
    await inngest.send({
      name:"headshot/generate-user-headshots",
      data
    })
  } catch (error) {
    throw new AppError(
      500,
      'INNGEST_TRIGGER',
      'Failed to trigger generate headshot ',
    );
  }
}

