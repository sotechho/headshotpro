import { PaymentStatus } from '@/types/payment.types';
import { z } from 'zod';
import { Types, isValidObjectId } from 'mongoose';

export const objectIdSchema = z
  .custom<Types.ObjectId>((val) => isValidObjectId(val), {
    message: 'Invalid Mongoose ObjectId',
  })
  .transform((val) => new Types.ObjectId(val));

export const userIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const orderIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const updateUserSchema = z
  .object({
    username: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
    credits: z.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one user field is required',
  });

export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(PaymentStatus)).optional(),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(Object.values(PaymentStatus)),
  })
  .strict();

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
