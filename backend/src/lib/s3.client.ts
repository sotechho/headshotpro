import { S3Client } from '@aws-sdk/client-s3';

import { config } from '@/config';
import { ExternalServiceError } from '@/utils/errors';
import logger from '@/utils/logger';

const { region, accessKeyId, accessSecretKey } = config.aws;

if (!region || !accessKeyId || !accessSecretKey) {
  logger.error('AWS S3 credentials are not configured');

  throw new ExternalServiceError('AWS S3 configuration is incomplete', 's3');
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey: accessSecretKey,
  },
});

export default s3Client;
