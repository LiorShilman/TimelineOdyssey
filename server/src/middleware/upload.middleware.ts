import multer from 'multer';
import { Request } from 'express';
import { MAX_FILE_SIZE, MAX_FILES_PER_MOMENT } from '../config/storage.config';
import { isValidFileType } from '../utils/file.utils';

// Use memory storage for processing before uploading to S3
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (isValidFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images and videos only.`));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_MOMENT,
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple files upload
export const uploadMultiple = upload.array('files', MAX_FILES_PER_MOMENT);
