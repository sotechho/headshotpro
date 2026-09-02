import { config } from '@/config';
import { Order, type IOrder } from '@/models/Order.modal';
import {
  PaymentPlatform,
  PaymentStatus,
  type MobileWalletPayload,
  type MobileWalletResponse,
  type PaymentResponse,
} from '@/types/payment.types';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';
import axios from 'axios';

class MobileWalletService {
  getPaymentConfig(platform: string) {
    if (platform === PaymentPlatform.EBIR) {
      return {
        apiUserId: config.ebir.EBIR_MERCHANT_API_USER_ID,
        apiKey: config.ebir.EBIR_MERCHANT_API_KEY,
        merchantUid: config.ebir.EBIR_MERCHANT_U_ID,
        apiEndPoint: config.ebir.EBIR_MERCHANT_API_END_POINT,
      };
    }
    return {
      apiUserId: config.waafipay.MERCHANT_API_USER_ID,
      apiKey: config.waafipay.MERCHANT_API_KEY,
      merchantUid: config.waafipay.MERCHANT_U_ID,
      apiEndPoint: config.waafipay.MERCHANT_API_END_POINT,
    };
  }

  async processWalletPayment(
    platform: string,
    order: IOrder,
    phone: string,
  ): Promise<PaymentResponse> {
    try {
      const { apiEndPoint, apiKey, apiUserId, merchantUid } =
        this.getPaymentConfig(platform);
      if (!apiUserId || !apiKey || !merchantUid || !apiEndPoint) {
        logger.warn(
          `${platform} configuration is missing. Please check your environment variables.`,
        );
        throw new AppError(
          500,
          'INTERNAL_SERVER_ERROR',
          'Failed to process payment',
        );
      }
      const payload: MobileWalletPayload = {
        schemaVersion: '1.0',
        requestId: order._id.toString() + '-' + Date.now(),
        timestamp: Date.now(),
        channelName: 'WEB',
        serviceName: 'API_PURCHASE',
        serviceParams: {
          merchantUid: merchantUid,
          apiUserId: apiUserId,
          apiKey: apiKey,
          paymentMethod: 'MWALLET_ACCOUNT',
          payerInfo: {
            accountNo: phone,
          },
          transactionInfo: {
            referenceId: order._id.toString(),
            invoiceId: '154',
            amount: Number(order.amount.toFixed(2)),
            currency: 'USD',
            description: `Headshot Pro Credits Purchase - ${order.credits} credits`,
            platform,
          },
        },
      };

      const { data } = await axios.post<MobileWalletResponse>(
        apiEndPoint,
        payload,
      );

      const isSuccess =
        data.responseCode === '2001' || data.responseMsg === 'RCS_SUCCESS';

      logger.info(`${platform} payment response: ${JSON.stringify(data)}`);

      if (!isSuccess) {
        await Order.findByIdAndUpdate(order._id, {
          status: PaymentStatus.FAILED,
          paymentDetails: data,
        });

        logger.error(`${platform} payment failed: ${data.responseMsg}`);
        return {
          success: false,
          message: `Payment failed: ${data.responseMsg}`,
          amount: order.amount,
          credits: order.credits,
          orderId: order._id.toString(),
          status: PaymentStatus.FAILED,
          error: {
            responseCode: data.responseCode,
            responseMsg: data.responseMsg,
          },
        };
      }

      await Order.findByIdAndUpdate(order._id, {
        status: PaymentStatus.PROCESSING,
        transactionId: data.transactionId || data.referenceId,
      });

      return {
        success: true,
        message: 'Payment processed successfully',
        amount: order.amount,
        credits: order.credits,
        orderId: order._id.toString(),
        redirectUrl: `${config.frontendUrl}/verify-payment?status=success`,
        status: PaymentStatus.PROCESSING,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        'MWALLET_PAYMENT_PROCESS',
        `Failed to process ${platform} payment: ${error.message}`,
      );
    }
  }
}

export const mobileWalletService = new MobileWalletService();
