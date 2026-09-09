import { headshotService } from '@/services/headshot';
import { s3Service } from '@/services/s3';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';
import logger from '@/utils/logger';
import {
  createdResponse,
  noContentResponse,
  successResponse,
} from '@/utils/responses';
import type { Request, Response } from 'express';

export async function getAvailableStyles(req: Request, res: Response) {
  const availableStyles = headshotService.getAvailableStyles();
  return successResponse(
    res,
    'Available Headshot Styles',
    200,
    availableStyles,
  );
}

export async function generateHeadshot(req: Request, res: Response) {
  const userId = req.user?.userId;
  const {
    selectedStyles: styles,
    customPrompt,
  }: { selectedStyles?: string; customPrompt?: string } = req.body;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  let selectedStyles: string[] | undefined = undefined;

  if (styles) {
    try {
      selectedStyles = JSON.parse(styles);
    } catch (error) {
      logger.error('Failed to parse selected styles json', {
        error,
      });
      throw new BadRequestError('Invalid style unable to process');
    }
  }

  logger.info(`Generating headshot for user ${userId}`);

  const file = req.file;
  if (!file) {
    logger.error('No file uploaded to generate', {
      userId,
    });
    throw new BadRequestError('File is required');
  }

  if ((!selectedStyles || selectedStyles.length === 0) && !customPrompt) {
    logger.error('Either styles or custom prompt is required', {
      userId,
    });
    throw new BadRequestError('Either styles or custom prompt is required');
  }

  logger.info('Preparing file buffer and extension');
  const fileBuffer = Buffer.from(file.buffer);
  const fileExtension = file.mimetype.split('/')[1] || 'jpg';
  logger.info(
    `File buffer and extension prepared: ${fileBuffer.length} bytes, extension: ${fileExtension} calling headshot generation service`,
  );
  const headshot = await headshotService.generateHeadshot({
    userId,
    selectedStyles,
    customPrompt,
    fileBuffer,
    fileExtension,
  });

  return createdResponse(
    res,
    'Triggered headshot generation it takes some minutes',
    headshot,
  );
}

export async function getHeadshots(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const limit = Math.max(1, Number(req.query.limit) || 10);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const { headshots, total } = await headshotService.getHeadshots(
    userId,
    limit,
    offset,
  );

  return successResponse(res, 'Headshots fetched', 200, {
    headshots,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getHeadshotById(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new BadRequestError('Invalid headshot id');
  }

  const headshot = (
    await headshotService.getHeadshotById(userId, id)
  ).toObject();

  const oneDay = 24 * 60 * 60;

  return successResponse(res, 'Headshot fetched', 200, {
    ...headshot,
    originalPhotoUrl: await s3Service.getSignedUrl(
      headshot.originalPhotoKey,
      oneDay,
    ),
    generatedHeadshots: await Promise.all(
      headshot.generatedHeadshots.map(
        async (generatedHeadshot: Record<any, any>) => ({
          ...generatedHeadshot,
          url: await s3Service.getSignedUrl(generatedHeadshot.key, oneDay),
        }),
      ),
    ),
  });
}

export async function deleteHeadshot(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { id } = req.params;
  if (typeof id !== 'string') {
    throw new BadRequestError('Invalid headshot id');
  }

  await headshotService.deleteHeadshot(userId, id);
  return noContentResponse(res);
}
