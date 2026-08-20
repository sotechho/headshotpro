import { authService } from '@/services/auth';
import { BadRequestError, ValidationError } from '@/utils/errors';
import logger from '@/utils/logger';
import { createdResponse, successResponse } from '@/utils/responses';
import { type Request, type Response } from 'express';

export async function register(req: Request, res: Response) {
  const data = req.body;
  const user = await authService.registerUser(data);
  return createdResponse(res, 'User registered successfully', {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      credits: user.credits,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    throw new BadRequestError('Missing verification token');
  }

  await authService.verifyUserEmail(token);

  return successResponse(res, 'Email verified successfully');
}

export async function resendVerificationEmail(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required', [
      { path: 'email', message: 'Email is required' },
    ]);
  }

  await authService.resendVerificationEmail(email);

  return successResponse(
    res,
    'Verification email resended please check your inbox',
  );
}
