import { User } from '@/models';
import { Order } from '@/models/Order.modal';
import { NotFoundError } from '@/utils/errors';
import { successResponse } from '@/utils/responses';
import type {
  AdminOrdersQuery,
  AdminUsersQuery,
  UpdateOrderStatusInput,
  UpdateUserInput,
} from '@/validators/admin.user.validator';
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
