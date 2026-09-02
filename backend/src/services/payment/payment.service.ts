import { CreditPackage, User, type ICreditPackage } from '@/models';
import { Order, type IOrder } from '@/models/Order.modal';
import {
  PaymentPlatform,
  PaymentStatus,
  type CreateOrderPrams,
  type PaymentResponse,
  type ProcessPaymentPrams,
} from '@/types/payment.types';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/utils/errors';
import logger from '@/utils/logger';
import mongoose from 'mongoose';
import { stripeService } from './stripe.service';
import { triggerAddUserCredits } from '../queue';

class PaymentService {
  async getCreditPackages(): Promise<ICreditPackage[]> {
    const credits = await CreditPackage.find({ isActive: true });
    return credits;
  }

  async getCreditPackageById(id: string): Promise<ICreditPackage> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestError('Invalid package id');
    }

    const creditPackage = await CreditPackage.findOne({
      _id: id,
      isActive: true,
    });

    if (!creditPackage) {
      throw new NotFoundError('Credit package not found');
    }

    return creditPackage;
  }

  async createOrder({
    packageId,
    userId,
    platform,
    phone,
    credits,
    amount,
  }: CreateOrderPrams): Promise<IOrder> {
    const order = await Order.create({
      user: userId,
      package: packageId,
      credits,
      creditsAdded: false,
      phone,
      platform,
      amount,
      status: PaymentStatus.PENDING,
    });
    return order;
  }

  async stripePaymentProcess({
    creditPackage,
    cancelUrl,
    successUrl,
    totalCredits,
    customerEmail,
    userId,
    order,
  }: {
    creditPackage: ICreditPackage;
    cancelUrl: string;
    successUrl: string;
    totalCredits: number;
    customerEmail?: string;
    userId: string;
    order: IOrder;
  }): Promise<PaymentResponse> {
    try {
      const session = await stripeService.createCheckoutSession({
        amount: creditPackage.price,
        cancelUrl,
        successUrl,
        credits: totalCredits,
        packageId: creditPackage._id.toString(),
        userId,
        metadata: {
          orderId: order._id.toString(),
          packageName: creditPackage.name.toString(),
        },
        customerEmail,
      });

      await Order.findByIdAndUpdate(order._id, {
        status: PaymentStatus.PROCESSING,
        stripeSessionId: session.sessionId,
      });

      return {
        success: true,
        message: 'Successfully created stripe session',
        sessionId: session.sessionId,
        amount: creditPackage.price,
        credits: totalCredits,
        orderId: order._id.toString(),
        status: PaymentStatus.PROCESSING,
        data: session,
        redirectUrl: session.redirectUrl,
      };
    } catch (error: any) {
      logger.error('Failed to process stripe payment', {
        userId,
        packageId: creditPackage._id.toString(),
        orderId: order._id,
        packageName: creditPackage.name,
        metadata: {
          ...error,
        },
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        'STRIPE_PAYMENT_PROCESS',
        'Failed to process stripe payment',
      );
    }
  }

  async processPayment({
    packageId,
    userId,
    platform,
    phone,
    cancelUrl,
    successUrl,
  }: ProcessPaymentPrams): Promise<PaymentResponse> {
    try {
      if (!Object.values(PaymentPlatform).includes(platform)) {
        // throw bad request error if platform does not match
        throw new BadRequestError(
          `Sorry we can not support this platform ${platform}. instead you can use ${Object.values(PaymentPlatform).join(',')}`,
        );
      }

      // find the package from the db
      const creditPackage = await this.getCreditPackageById(packageId);
      // calculate credits
      const totalCredits = creditPackage.credits + (creditPackage.bonus || 0);
      // create an order
      const order = await this.createOrder({
        userId,
        packageId,
        platform,
        phone,
        credits: totalCredits,
        amount: creditPackage.price,
      });

      const user = await User.findById(userId);

      let result: PaymentResponse | undefined = undefined;

      // check which platform user want to pay
      if (platform === PaymentPlatform.STRIPE) {
        // process stripe payment platform
        result = await this.stripePaymentProcess({
          cancelUrl,
          successUrl,
          creditPackage,
          order,
          totalCredits,
          userId,
          customerEmail: user?.email,
        });
      }

      return result!;
    } catch (error) {
      throw error;
    }
  }

  async processSuccessfulPayment(
    orderId: string,
    source: 'STRIPE' | 'LOCAL' | 'ADMIN' = 'STRIPE',
  ): Promise<void> {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError(
          'Order not found in stripe checkout session completed',
        );
      }

      if (order.creditsAdded) {
        logger.error('user credits already added', { orderId, source });
        throw new ConflictError('User credits already added');
      }

      await triggerAddUserCredits({
        orderId,
        source,
        credits: order.credits,
        userId: order.user.toString(),
      });
    } catch (error) {
      logger.error('Failed to proccess successfull payment', {
        orderId,
        source,
      });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
