import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

// Max file size: 5MB
export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['application/pdf'];

// PDF Magic Bytes: %PDF- (hex: 25 50 44 46)
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]);

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return cb(
      ApiError.badRequest('Only PDF documents are supported for resume uploads.')
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware for single PDF file upload with magic byte verification.
 */
export const uploadResumeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err: any) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            ApiError.badRequest(
              `File size exceeds maximum allowed limit of ${MAX_RESUME_FILE_SIZE_BYTES / (1024 * 1024)}MB.`
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            ApiError.badRequest('Unexpected field name. Please use "resume" as the file field.')
          );
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      }
      return next(err);
    }

    if (!req.file) {
      return next(ApiError.badRequest('No resume file was provided in the request.'));
    }

    // Magic byte inspection for PDF header (%PDF-)
    if (req.file.buffer.length < 4) {
      return next(ApiError.badRequest('Uploaded file is corrupted or empty.'));
    }

    const header = req.file.buffer.subarray(0, 4);
    if (!header.equals(PDF_MAGIC_BYTES)) {
      return next(
        ApiError.badRequest(
          'Security check failed: File content does not match a genuine PDF format.'
        )
      );
    }

    return next();
  });
};
