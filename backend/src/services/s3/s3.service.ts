import { config } from '@/config';
import s3Client from '@/lib/s3.client';
import type { UploadFileResponse } from '@/types/s3.types';
import { ExternalServiceError } from '@/utils/errors';
import logger from '@/utils/logger';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getSignedUrlPresigner } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = config.aws.bucketName as string;
  }

  private generateKey(userId: string, prefix: string, fileExtension: string) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${prefix}/${userId}/${timestamp}-${randomString}.${fileExtension}`;
  }

  async uploadOriginalFile(
    userId: string,
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<UploadFileResponse> {
    try {
      const key = this.generateKey(userId, 'original', fileExtension);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        Metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
        },
      });
      await s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
      return {
        key,
        bucket: this.bucketName,
        url,
      };
    } catch (error: any) {
      logger.error('Original File upload failed aws s3', { ...error });
      throw new ExternalServiceError(
        'Failed to upload original file upload',
        's3',
      );
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const signedUrl = await getSignedUrlPresigner(s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error: any) {
      logger.error('Signed Url failed aws s3', { ...error, key });
      throw new ExternalServiceError('Failed to generate signed url', 's3');
    }
  }
}

export const s3Service = new S3Service();
