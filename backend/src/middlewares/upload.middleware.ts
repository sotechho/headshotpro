import { config } from '@/config';
import { BadRequestError } from '@/utils/errors';
import type { Request } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

function filterFileUpload(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!config.upload.allowedFilesMimeTypes.includes(file.mimetype)) {
    return cb(new BadRequestError('Unsupported image file type'));
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter: filterFileUpload,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles,
  },
});
