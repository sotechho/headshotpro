import { HEADSHOT_STYLES } from '@/constants';
import { User } from '@/models';
import { Headshot, type IHeadshot } from '@/models/Headshot.modal';
import { s3Service } from '@/services/s3';
import {
  AppError,
  InsufficientCreditError,
  NotFoundError,
} from '@/utils/errors';
import logger from '@/utils/logger';
import { triggerGenerateHeadshots } from '../queue';

export type HeadshotStyle = keyof typeof HEADSHOT_STYLES;

interface GenerateHeadshotParams {
  userId: string;
  selectedStyles?: string[];
  customPrompt?: string;
  fileBuffer: Buffer;
  fileExtension: string;
}

class HeadshotService {
  getAvailableStyles(): { name: string; key: string; description: string }[] {
    const styles = (Object.keys(HEADSHOT_STYLES) as HeadshotStyle[]).map(
      (key) => ({
        ...HEADSHOT_STYLES[key],
        prompt: undefined,
      }),
    );
    return styles;
  }

  async generateHeadshot(params: GenerateHeadshotParams): Promise<IHeadshot> {
    const { userId, selectedStyles, customPrompt, fileBuffer, fileExtension } =
      params;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`User ${userId} found with ${user.credits} credits`, {
      userId,
      selectedStyles,
      customPrompt,
    });

    const creditsNeeded =
      (selectedStyles ? selectedStyles.length : 0) + (customPrompt ? 1 : 0);
    if (user.credits < creditsNeeded) {
      logger.info(
        `User ${userId} has insufficient credits: ${user.credits} < ${creditsNeeded}`,
      );
      throw new InsufficientCreditError(
        `You do not have enough credits to generate a headshot: you need ${creditsNeeded} credits`,
      );
    }

    logger.info(`Deducting ${creditsNeeded} credits from user ${userId}`);
    user.credits -= creditsNeeded;
    await user.save();

    // upload
    logger.info(`Upload file to s3`, {
      userId,
      fileBuffer: fileBuffer.length,
    });

    try {
      const { key, url } = await s3Service.uploadOriginalFile(
        userId,
        fileBuffer,
        fileExtension,
      );

      const oneDay = 24 * 60 * 60;
      const signedUrl = await s3Service.getSignedUrl(key, oneDay);
      logger.info('Generated signedUrl', {
        userId,
        signedUrl,
        expiresIn: oneDay,
      });

      logger.info('Record headshot', {
        userId,
        key,
        url,
      });
      const headshot = await Headshot.create({
        user: user._id,
        originalPhotoKey: key,
        originalPhotoUrl: url,
        selectedStyles,
        customPrompt,
        processingStartedAt: new Date().toISOString(),
      });
      logger.info('Triggering headshot generation event queue');

      await triggerGenerateHeadshots({
        headshotId: headshot._id.toString(),
        userId,
        photoUrl: signedUrl,
        selectedStyles: selectedStyles as HeadshotStyle[],
        customPrompt,
      });
      return headshot;
    } catch (error: any) {
      logger.error('Failed to generate headshots', { error });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        'HEADSHOT_GENERATION',
        'Failed to generate headshots',
      );
    }
  }
}

export const headshotService = new HeadshotService();
