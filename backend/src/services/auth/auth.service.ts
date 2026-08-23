import { User, type IUser } from '@/models/User.model';
import type {
  GenerateAccessAndRefreshToken,
  LoginServiceResponse,
  TokenPayload,
} from '@/types';
import { normalizeEmail } from '@/utils';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils/errors';
import type { RegisterInput } from '@/validators/auth.validator';
import { mailService } from '../notifications/';
import { passwordService } from './password.service';
import { tokenService } from './token.service';
import { verificationService } from './verification.service';

class AuthService {
  async registerUser(input: RegisterInput): Promise<IUser> {
    // normalize email
    const normalizedEmail = normalizeEmail(input.email);

    // check if user exists
    await this.checkUserExists(normalizedEmail);

    // hash password
    const hashedPassword = await passwordService.hashPassword(
      input.password.trim(),
    );

    // generate verification token and expire date
    const emailVerificationToken = verificationService.generateToken();
    const emailVerificationTokenExpires =
      verificationService.generateExpirationDate();

    // username from email or actual username
    const username: string = (
      input.username ? input.username.trim() : normalizedEmail.split('@')[0]
    ) as string;

    // store
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      username: username,
      emailVerificationToken,
      emailVerificationTokenExpires,
    });

    // send verification email
    await mailService.sendVerificationMail(
      normalizedEmail,
      username,
      emailVerificationToken,
    );

    return user;
  }

  async verifyUserEmail(token: string): Promise<void> {
    // Find user using token
    const user = await User.findOne({ emailVerificationToken: token }).select(
      '+emailVerificationToken +emailVerificationTokenExpires',
    );

    if (!user) {
      throw new BadRequestError('Invalid token provided');
    }

    const expired = verificationService.isTokenExpires(
      user.emailVerificationTokenExpires as Date,
    );

    if (expired) {
      throw new BadRequestError('Verification token expired');
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    user.emailVerified = true;

    await user.save();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new NotFoundError(
        `Not found account with ${normalizedEmail} please register your account`,
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'Your account is deactivated please contact the support',
      );
    }

    if (user.emailVerified) {
      throw new ConflictError('Email already verified');
    }

    const emailVerificationToken = verificationService.generateToken();
    const emailVerificationTokenExpires =
      verificationService.generateExpirationDate();

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    user.emailVerified = false;

    await user.save();

    const name = user.username || (normalizedEmail.split('@')[0] as string);
    await mailService.sendVerificationMail(
      normalizedEmail,
      name,
      emailVerificationToken,
    );
  }

  async login(email: string, password: string): Promise<LoginServiceResponse> {
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password',
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'Contact the support team your account is deactivated',
      );
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError('Verify your email to login');
    }

    const isMatched = await passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isMatched) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = tokenService.generateAccessAndRefreshTokens({
      email: normalizedEmail,
      userId: user._id.toString(),
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user,
      ...tokens,
    };
  }

  async getCurrentUser(payload: TokenPayload): Promise<IUser> {
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new NotFoundError('user not exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'contact the support team your account is deactivated',
      );
    }

    return user;
  }

  async refreshToken(token: string): Promise<GenerateAccessAndRefreshToken> {
    const payload = tokenService.verifyRefreshToken(token);
    const user = await User.findById(payload.userId).select('+refreshToken');

    if (!user) {
      throw new NotFoundError('user not exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'contact the support team your account is deactivated',
      );
    }

    if (token !== user.refreshToken) {
      throw new UnauthorizedError('Invalid token');
    }

    const tokens = tokenService.generateAccessAndRefreshTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(payload: TokenPayload) {
    await User.findByIdAndUpdate(payload.userId, { refreshToken: null });
  }

  // helpers
  private async checkUserExists(email: string): Promise<void> {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError(
        `User already exists with this email address ${email}`,
      );
    }
  }
}

export const authService = new AuthService();
