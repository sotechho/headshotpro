import { authController } from '@/controller';
import {
  validateQuery,
  validateRequest,
} from '@/middlewares/validator.middleware';
import { registerSchema, verifyEmailSchema } from '@/validators/auth.validator';
import { Router } from 'express';

const router = Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);
router.get(
  '/verify-email',
  validateQuery(verifyEmailSchema),
  authController.verifyEmail,
);
export default router;
