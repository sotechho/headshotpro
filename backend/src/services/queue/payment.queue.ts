import { inngest } from '@/lib/inngest.client';
import { User } from '@/models';
import { Order } from '@/models/Order.modal';
import { PaymentStatus } from '@/types/payment.types';
import logger from '@/utils/logger';
import { NonRetriableError } from 'inngest';
import { mailService } from '../notifications';
import type { IAddCreditEventData } from './queue.service';

export function addUserCredits() {
  return inngest.createFunction(
    {
      id: 'payment-add-user-credit',
      name: 'Add user credits',
      retries: 3,
      triggers: [{ event: 'payment/add-user-credit' }],
    },
    async function ({ event, step }) {
      try {
        const { orderId, credits, source, userId } =
          event.data as IAddCreditEventData;

        // Step 1: validate the order
        const { order, creditsAdded } = await step.run(
          'validate-order',
          async () => {
            const order = await Order.findById(orderId);

            if (!order) {
              logger.error('Order not found: add user credit event: step 1', {
                ...event.data,
              });

              throw new NonRetriableError(
                'Order not found: add user credit event',
              );
            }

            // Already processed
            if (order.creditsAdded) {
              return {
                creditsAdded: true,
                order,
              };
            }

            return {
              creditsAdded: false,
              order,
            };
          },
        );

        // Already added
        if (creditsAdded) {
          logger.warn('Credits already added', {
            ...event.data,
            skipped: true,
          });

          return {
            success: true,
            skipped: true,
            message: 'Credits already added',
            source,
          };
        }

        // Step 2: add credits
        const result = await step.run('add-credits', async () => {
          const user = await User.findById(userId);

          if (!user) {
            logger.error('User not found: add user credit event: step 2', {
              ...event.data,
            });

            throw new NonRetriableError(
              'User not found: add user credit event',
            );
          }

          const previousBalance = user.credits;
          const newBalance = previousBalance + credits;

          user.credits = newBalance;

          await user.save();

          await Order.findByIdAndUpdate(order._id, {
            creditsAdded: true,
            status: PaymentStatus.COMPLETED,
          });

          logger.info(
            `Credits added user: ${user._id} order:${order._id} using ${source}`,
          );

          return {
            success: true,
            previousBalance,
            newBalance,
            userEmail: user.email,
            userName: (user.username || user.email.split('@')[0]) as string,
            orderId,
            creditsAdded: credits,
            orderAmount: order.amount,
          };
        });

        // Step 3: notify
        await step.run('notify-user', async () => {
          try {
            await mailService.sendPaymentSuccessMail(
              result.userEmail,
              result.userName,
              result.orderId,
              result.orderAmount,
              result.creditsAdded,
              result.newBalance,
            );
            logger.info('Payment success email sent', {
              userEmail: result.userEmail,
              userName: result.userName,
            });
          } catch (error: any) {
            logger.error('Failed to send payment success email', {
              error: error?.message,
              stack: error?.stack,
              data: event.data,
            });
            throw new NonRetriableError('Failed to send payment success email');
          }
        });

        return {
          success: true,
          data: result,
          message: 'Credits added successfully',
          skipped: false,
        };
      } catch (error: any) {
        logger.error('Failed to add user credits event', {
          error: error?.message,
          stack: error?.stack,
          data: event.data,
        });

        throw error;
      }
    },
  );
}
