import { User, type IUser } from '@/models/User.model';
import { normalizeEmail } from '@/utils';
import { BadRequestError, ConflictError } from '@/utils/errors';
import type { RegisterInput } from '@/validators/auth.validator';
import { passwordService } from './password.service';
import { verificationService } from './verification.service';
import { mailService } from '../notifications/';

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
