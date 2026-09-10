import { adminUserController } from '@/controller';
import { authenticate, authorize } from '@/middlewares';
import {
  validateParams,
  validateQuery,
  validateRequest,
} from '@/middlewares/validator.middleware';
import {
  adminOrdersQuerySchema,
  adminUsersQuerySchema,
  createManualOrderScheam,
  orderIdParamsSchema,
  updateOrderStatusSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '@/validators/admin.user.validator';
import { Router } from 'express';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get(
  '/users',
  validateQuery(adminUsersQuerySchema),
  adminUserController.getAllUsers,
);
router.patch(
  '/users/:id',
  validateParams(userIdParamsSchema),
  validateRequest(updateUserSchema),
  adminUserController.updateUser,
);
router.get(
  '/orders',
  validateQuery(adminOrdersQuerySchema),
  adminUserController.getAllOrders,
);
router.patch(
  '/orders/:id',
  validateParams(orderIdParamsSchema),
  validateRequest(updateOrderStatusSchema),
  adminUserController.updateOrderStatus,
);
router.post(
  '/orders/manual/create',
  validateRequest(createManualOrderScheam),
  adminUserController.createManualOrder,
);

export default router;
