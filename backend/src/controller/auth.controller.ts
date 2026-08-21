import { config } from '@/config';
import { authService } from '@/services/auth';
import type { TokenPayload } from '@/types';
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from '@/utils/errors';
import { createdResponse, successResponse } from '@/utils/responses';
import type { LoginInput } from '@/validators/auth.validator';
import { type Request, type Response } from 'express';

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

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

export async function login(req: Request, res: Response) {
  const { email, password }: LoginInput = req.body;
  const { accessToken, refreshToken, user } = await authService.login(
    email,
    password,
  );

  res.cookie('accessToken', accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    ...cookieOptions,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...cookieOptions,
  });

  return successResponse(res, 'Login successfully', 200, {
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

export async function getCurrentUser(req: Request, res: Response) {
  const user = await authService.getCurrentUser(
    req.user as unknown as TokenPayload,
  );
  return successResponse(res, 'User fetched successfully', 200, {
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

export async function refreshToken(req: Request, res: Response) {
  let token = req.cookies.refreshToken;

  if (!token && req.body) {
    token = req.body.refreshToken;
  }

  if (!token) {
    throw new UnauthorizedError('refresh token is required');
  }

  const { accessToken, refreshToken } = await authService.refreshToken(token);

  res.cookie('accessToken', accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    ...cookieOptions,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...cookieOptions,
  });

  return successResponse(res, 'Token refreshed successfully');
}
