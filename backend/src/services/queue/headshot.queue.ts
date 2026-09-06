import { inngest } from '@/lib/inngest.client';
import { Headshot } from '@/models/Headshot.modal';
import {
  HeadshotStatus,
  type GeneratedResponse,
  type PersistedHeadshot,
} from '@/types/headshot.types';
import {
  downloadFile,
  generateHeadshotImage,
  getFileExtension,
  getGenerationJobs,
} from '@/utils';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';
import { NonRetriableError } from 'inngest';
import { s3Service } from '../s3';
import type { IGenerateHeadshotEventData } from './queue.service';

export function generateUserHeadshots() {
  return inngest.createFunction(
    {
      id: 'generate-user-headshots',
      name: 'Generate user headshots',
      retries: 2,
      triggers: [{ event: 'headshot/generate-user-headshots' }],
      onFailure: async ({ error, event }) => {
        const { headshotId, userId } = event.data.event
          .data as IGenerateHeadshotEventData;

        logger.error(
          'onFailure: all retries exhausted — marking Headshot FAILED',
          {
            headshotId,
            userId,
            error: error.message,
            cause:
              'Last throw came from generate-headshots, upload-generated-headshots-to-s3, or update-headshot-document',
          },
        );

        await Headshot.findByIdAndUpdate(headshotId, {
          status: HeadshotStatus.FAILED,
          failureReason: error.message,
          processingCompletedAt: new Date(),
        });
      },
    },
    async function ({ event, step }) {
      try {
        const { headshotId, photoUrl, userId, customPrompt, selectedStyles } =
          event.data as IGenerateHeadshotEventData;

        logger.info('Headshot queue started', {
          headshotId,
          userId,
          selectedStyles,
          hasCustomPrompt: Boolean(customPrompt),
          photoUrl,
        });

        // Step 1: generate images with the AI provider.
        // Failures here are usually: missing styles/prompt, unknown style,
        // unconfigured provider, expired signed photoUrl, or provider API errors.
        const generatedResult = await step.run(
          'generate-headshots',
          async (): Promise<GeneratedResponse[]> => {
            logger.info('Step 1 started: generate-headshots', {
              headshotId,
              userId,
            });

            const jobs = getGenerationJobs(selectedStyles, customPrompt, {
              userId,
              headshotId,
            });
            const results = await Promise.all(
              jobs.map((job) =>
                generateHeadshotImage(photoUrl, job.prompt, job.style, userId),
              ),
            );

            const succeeded = results.filter((result) => result.success);
            const failed = results.filter((result) => !result.success);

            logger.info('Step 1 finished: generate-headshots', {
              headshotId,
              userId,
              requested: results.length,
              succeeded: succeeded.map((result) => result.style),
              failed: failed.map((result) => result.style),
            });

            if (succeeded.length === 0) {
              logger.error(
                'Step 1 failed early: every AI generation returned unsuccessful',
                {
                  headshotId,
                  userId,
                  failedStyles: failed.map((result) => result.style),
                  cause:
                    'AI provider error, empty output URL, or invalid photoUrl',
                },
              );
              throw new AppError(
                500,
                'HEADSHOT_GENERATION_ERROR',
                `All headshot generations failed: ${failed.map((result) => result.style).join(', ')}`,
              );
            }

            return results;
          },
        );

        // Step 2: download provider URLs and persist to S3.
        // Failures here are usually: provider URL expired, empty download,
        // bad content-type, or S3 credentials/bucket errors.
        const persistedHeadshots = await step.run(
          'upload-generated-headshots-to-s3',
          async (): Promise<PersistedHeadshot[]> => {
            const successful = generatedResult.filter(
              (result) => result.success,
            );

            logger.info('Step 2 started: upload-generated-headshots', {
              headshotId,
              userId,
              toPersist: successful.map((result) => result.style),
            });

            const uploaded = await Promise.all(
              successful.map(async (result) => {
                try {
                  logger.info('Step 2 downloading generated image', {
                    userId,
                    headshotId,
                    style: result.style,
                    sourceUrl: result.url,
                  });
                  const { fileBuffer, response } = await downloadFile(
                    result.url,
                  );
                  if (!fileBuffer.length) {
                    logger.error(
                      'Step 2 download failed: empty image buffer — source URL may be invalid or expired',
                      {
                        userId,
                        headshotId,
                        style: result.style,
                        sourceUrl: result.url,
                      },
                    );
                    return null;
                  }

                  const fileExtension = getFileExtension(
                    result.url,
                    String(response.headers['content-type'] ?? ''),
                  );

                  logger.info('Step 2 uploading generated image to S3', {
                    userId,
                    headshotId,
                    style: result.style,
                    bytes: fileBuffer.length,
                    fileExtension,
                  });
                  const uploadedFile = await s3Service.uploadGeneratedFile(
                    userId,
                    fileBuffer,
                    fileExtension,
                  );

                  logger.info('Step 2 persisted generated image', {
                    userId,
                    headshotId,
                    style: result.style,
                    key: uploadedFile.key,
                    url: uploadedFile.url,
                  });

                  return {
                    style: result.style,
                    key: uploadedFile.key,
                    url: uploadedFile.url,
                  };
                } catch (error: any) {
                  logger.error(
                    'Step 2 persist failed — download from provider URL or S3 upload',
                    {
                      userId,
                      headshotId,
                      style: result.style,
                      sourceUrl: result.url,
                      error: error?.message,
                      stack: error?.stack,
                    },
                  );
                  return null;
                }
              }),
            );

            const persisted = uploaded.filter(
              (item): item is PersistedHeadshot => item !== null,
            );

            logger.info('Step 2 finished: upload-generated-headshots', {
              headshotId,
              userId,
              persisted: persisted.map((item) => item.style),
              persistFailed: successful
                .filter(
                  (result) =>
                    !persisted.some((item) => item.style === result.style),
                )
                .map((result) => result.style),
            });

            if (persisted.length === 0) {
              logger.error(
                'Step 2 failed early: no generated images were saved to S3',
                {
                  headshotId,
                  userId,
                  styles: successful.map((result) => result.style),
                  cause:
                    'Could not download provider URLs or S3 upload rejected all files',
                },
              );
              throw new AppError(
                500,
                'UPLOAD_HEADSHOT_ERROR',
                `Failed to persist generated headshots: ${successful.map((result) => result.style).join(', ')}`,
              );
            }

            return persisted;
          },
        );

        // Step 3: write generated URLs/keys onto the Headshot document.
        // Failures here are usually: invalid headshotId or Mongo write errors.
        await step.run('update-headshot-document', async () => {
          logger.info('Step 3 started: update-headshot-document', {
            headshotId,
            userId,
          });

          const failedStyles = generatedResult
            .filter((result) => !result.success)
            .map((result) => result.style);

          const persistedStyles = new Set(
            persistedHeadshots.map((item) => item.style),
          );

          const unpersistedStyles = generatedResult
            .filter(
              (result) => result.success && !persistedStyles.has(result.style),
            )
            .map((result) => result.style);

          const failed = [...failedStyles, ...unpersistedStyles];

          logger.info('Step 3 updating Headshot status', {
            headshotId,
            userId,
            persistedCount: persistedHeadshots.length,
            generationFailedStyles: failedStyles,
            persistFailedStyles: unpersistedStyles,
            status: HeadshotStatus.COMPLETED,
          });

          const updated = await Headshot.findByIdAndUpdate(
            headshotId,
            {
              generatedHeadshots: persistedHeadshots.map((item) => ({
                style: item.style,
                url: item.url,
                key: item.key,
                createdAt: new Date(),
              })),
              status: HeadshotStatus.COMPLETED,
              failureReason:
                failed.length > 0
                  ? `Failed styles: ${failed.join(', ')}`
                  : undefined,
              processingCompletedAt: new Date(),
            },
            { new: true },
          );

          if (!updated) {
            logger.error(
              'Step 3 failed early: Headshot document not found — invalid or deleted headshotId',
              { headshotId, userId },
            );
            throw new NonRetriableError(
              `Headshot document not found: ${headshotId}`,
            );
          }

          logger.info('Step 3 finished: Headshot document updated', {
            headshotId,
            userId,
            persistedCount: persistedHeadshots.length,
          });
        });

        logger.info('Headshot queue completed', {
          headshotId,
          userId,
          generated: persistedHeadshots.length,
        });

        return {
          success: true,
          headshotId,
          generated: persistedHeadshots.length,
        };
      } catch (error: any) {
        logger.error(
          'Headshot queue threw — Inngest will retry unless NonRetriableError',
          {
            error: error?.message,
            stack: error?.stack,
            data: event.data,
          },
        );

        throw error;
      }
    },
  );
}
