import { HEADSHOT_STYLES } from '@/constants';
import { aiService } from '@/services/ai';
import type { HeadshotStyle } from '@/services/headshot';
import type { GeneratedResponse, GenerationJob } from '@/types/headshot.types';
import { NonRetriableError } from 'inngest';
import logger from './logger';

export function buildStylePrompt(
  styleKey: HeadshotStyle,
  customPrompt?: string,
) {
  const style = HEADSHOT_STYLES[styleKey];
  if (!style) {
    throw new NonRetriableError(`Unknown headshot style: ${styleKey}`);
  }

  if (!customPrompt) {
    return style.prompt;
  }

  return [
    style.prompt,
    `User instructions (higher priority): ${customPrompt}`,
  ].join('\n');
}

export function getGenerationJobs(
  selectedStyles?: HeadshotStyle[],
  customPrompt?: string,
  context?: { userId: string; headshotId: string },
): GenerationJob[] {
  const styles = selectedStyles?.filter(Boolean) ?? [];

  if (styles.length === 0 && !customPrompt) {
    logger.error(
      'Step 1 validation failed: neither selectedStyles nor customPrompt provided',
      context,
    );
    throw new NonRetriableError('Either styles or custom prompt is required');
  }

  if (styles.length === 0 && customPrompt) {
    logger.info('Step 1 jobs: custom prompt only', {
      ...context,
      jobCount: 1,
    });
    return [{ style: 'custom', prompt: customPrompt }];
  }

  logger.info('Step 1 jobs: selected styles', {
    ...context,
    styles,
    hasCustomPrompt: Boolean(customPrompt),
    jobCount: styles.length,
  });

  return styles.map((styleKey) => ({
    style: styleKey,
    prompt: buildStylePrompt(styleKey, customPrompt),
  }));
}

export async function generateHeadshotImage(
  photoUrl: string,
  prompt: string,
  style: string,
  userId: string,
): Promise<GeneratedResponse> {
  try {
    const service = aiService();
    if (!service) {
      logger.error(
        'Step 1 failed early: AI provider is not configured or returned null',
        { userId, style },
      );
      throw new Error('AI provider is not configured');
    }

    logger.info('Step 1 generating image via AI provider', {
      userId,
      style,
      prompt,
      photoUrl,
    });
    const generatedImageUrl = await service.generateImage(photoUrl, prompt);

    if (!generatedImageUrl) {
      logger.error(
        'Step 1 AI returned empty image URL — provider output missing url',
        { userId, style },
      );
      return { success: false, style, url: '' };
    }

    logger.info('Step 1 generated image successfully', {
      userId,
      style,
      generatedImageUrl,
    });

    return {
      success: true,
      style,
      url: generatedImageUrl,
    };
  } catch (error: any) {
    logger.error(
      'Step 1 AI generateImage failed — check provider config, photoUrl expiry, or prompt',
      {
        prompt,
        style,
        userId,
        photoUrl,
        error: error?.message,
        stack: error?.stack,
      },
    );

    return {
      success: false,
      style,
      url: '',
    };
  }
}
