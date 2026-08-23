import { User } from '@/models/User.model';
import { tokenService } from '@/services/auth/token.service';
import { NotFoundError, UnauthorizedError } from '@/utils/errors';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      const authorization = req.headers.authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.substring(7);
      }
    }

    if (!token) {
      throw new UnauthorizedError('access token is required');
    }

    const payload = tokenService.verifyAccessToken(token);

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new NotFoundError('user not exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'contact the support team your account is deactivated',
      );
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
