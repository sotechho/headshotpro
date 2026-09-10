import { CreditPackage, User } from '@/models';
import { Order } from '@/models/Order.modal';
import { PaymentPlatform, PaymentStatus } from '@/types/payment.types';
import { BadRequestError, NotFoundError } from '@/utils/errors';
import { createdResponse, successResponse } from '@/utils/responses';
import type {
  AdminOrdersQuery,
  AdminUsersQuery,
  CreateManualOrderInput,
  UpdateOrderStatusInput,
  UpdateUserInput,
} from '@/validators/admin.user.validator';
import crypto from 'crypto';
import type { Request, Response } from 'express';

export async function getAllUsers(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as AdminUsersQuery;
  const skip = (page - 1) * limit;
  const filter = {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return successResponse(res, 'Users fetched', 200, {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body as UpdateUserInput;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return successResponse(res, 'User updated', 200, user);
}

export async function getAllOrders(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as AdminOrdersQuery;
  const skip = (page - 1) * limit;
  const filter = status ? { status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate([
        {
          path: 'user',
          select:
            '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
        },
        { path: 'package' },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return successResponse(res, 'Orders fetched', 200, {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as UpdateOrderStatusInput;

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  ).populate([
    {
      path: 'user',
      select:
        '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
    },
    { path: 'package' },
  ]);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return successResponse(res, 'Order status updated', 200, order);
}

export async function createManualOrder(req: Request, res: Response) {
  const { packageId, userId }: CreateManualOrderInput = req.body;

  const [user, creditPackage] = await Promise.all([
    User.findById(userId),
    CreditPackage.findById(packageId),
  ]);

  if (!user) {
    throw new NotFoundError('User does not exits');
  }

  if (!creditPackage) {
    throw new NotFoundError('Credit Package does not exits');
  }

  if (!creditPackage.isActive) {
    throw new BadRequestError('Credit Package is not active current');
  }

  const transactionId = crypto.randomBytes(8).toString('hex');

  const orderPayload = {
    amount: Number(creditPackage.price),
    credits: Number(creditPackage.credits + (creditPackage.bonus || 0)),
    creditsAdded: true,
    transactionId: `manual-payment-${Date.now()}-${transactionId}`,
    paymentDetails: {
      type: 'Manual',
      createdBy: req.user?.email,
    },
    platform: PaymentPlatform.EVC,
    user: user._id.toString(),
    package: creditPackage._id.toString(),
    status: PaymentStatus.COMPLETED,
  };

  await Promise.all([
    Order.create(orderPayload),
    User.findByIdAndUpdate(user._id, {
      $inc: {
        credits: orderPayload.credits,
      },
    }),
  ]);

  return createdResponse(res, 'Order successfully created');
}
