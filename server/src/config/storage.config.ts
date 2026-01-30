import { S3Client } from '@aws-sdk/client-s3';

const {
  AWS_ACCESS_KEY_ID = 'minioadmin',
  AWS_SECRET_ACCESS_KEY = 'minioadmin123',
  AWS_ENDPOINT = 'http://localhost:9000',
  AWS_BUCKET_NAME = 'timeline-odyssey',
  AWS_REGION = 'us-east-1',
} = process.env;

// S3 client configuration for MinIO
export const s3Client = new S3Client({
  endpoint: AWS_ENDPOINT,
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKET_NAME = AWS_BUCKET_NAME;

// Media file size limits (in bytes)
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES_PER_MOMENT = 20;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];
