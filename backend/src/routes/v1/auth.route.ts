import { authController } from '@/controller';
import {
  validateQuery,
  validateRequest,
} from '@/middlewares/validator.middleware';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '@/validators/auth.validator';
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
router.post(
  '/resend-verification',
  validateRequest(resendVerificationSchema),
  authController.resendVerificationEmail,
);
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login,
);
export default router;
