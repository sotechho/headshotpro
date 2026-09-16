import { authController } from '@/controller';
import { authenticate, rateLimit } from '@/middlewares';
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
  rateLimit.auth.register,
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
  rateLimit.auth.resendVerification,
  validateRequest(resendVerificationSchema),
  authController.resendVerificationEmail,
);
router.post(
  '/login',
  rateLimit.auth.login,
  validateRequest(loginSchema),
  authController.login,
);

router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;
