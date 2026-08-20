import type { IUser } from '@/models/User.model';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface GenerateAccessAndRefreshToken {
  accessToken: string;
  refreshToken: string;
}

export interface LoginServiceResponse extends GenerateAccessAndRefreshToken {
  user: IUser;
}
