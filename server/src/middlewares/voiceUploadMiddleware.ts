import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const MAX_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mpeg',
  'audio/mp3',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'application/octet-stream',
];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mime = file.mimetype.toLowerCase();
  const isAllowed = ALLOWED_AUDIO_MIME_TYPES.some((allowed) =>
    mime.startsWith(allowed.split(';')[0])
  );

  if (!isAllowed) {
    return cb(
      ApiError.badRequest(
        `Unsupported audio format (${file.mimetype}). Please record in WebM, WAV, MP4, or OGG.`
      )
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_AUDIO_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware for single audio file upload.
 */
export const uploadAudioMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const singleUpload = upload.single('audio');

  singleUpload(req, res, (err: any) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            ApiError.badRequest(
              `Audio file size exceeds maximum allowed limit of ${MAX_AUDIO_FILE_SIZE_BYTES / (1024 * 1024)}MB.`
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            ApiError.badRequest('Unexpected field name. Please use "audio" as the file field.')
          );
        }
      }
      return next(err);
    }
    next();
  });
};
