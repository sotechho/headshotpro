import { headshotService } from '@/services/headshot';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';
import logger from '@/utils/logger';
import { createdResponse, successResponse } from '@/utils/responses';
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
