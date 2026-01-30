import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from '../config/storage.config';
import prisma from '../config/database.config';
import {
  generateUniqueFilename,
  getS3Key,
  getFileTypeCategory,
} from '../utils/file.utils';

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Process image: resize and optimize
 */
async function processImage(
  buffer: Buffer,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<ProcessedImage> {
  const { maxWidth = 1920, quality = 85 } = options;

  const image = sharp(buffer);
  const metadata = await image.metadata();

  let processedImage = image;

  // Resize if larger than max width
  if (metadata.width && metadata.width > maxWidth) {
    processedImage = processedImage.resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG and optimize
  const processed = await processedImage
    .jpeg({ quality, progressive: true })
    .toBuffer();

  const finalMetadata = await sharp(processed).metadata();

  return {
    buffer: processed,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
    format: 'jpeg',
  };
}

/**
 * Generate thumbnail from image
 */
async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/**
 * Upload file to S3
 */
async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL (MinIO format)
  return `http://localhost:9000/${BUCKET_NAME}/${key}`;
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Upload media file for a moment
 */
export async function uploadMomentMedia(
  userId: string,
  momentId: string,
  file: Express.Multer.File,
  orderIndex: number = 0
) {
  const fileType = getFileTypeCategory(file.mimetype);
  const originalFilename = generateUniqueFilename(file.originalname);

  let storageKey: string;
  let thumbnailKey: string | undefined;
  let width: number | undefined;
  let height: number | undefined;

  if (fileType === 'image') {
    // Process image
    const processed = await processImage(file.buffer);
    const thumbnail = await generateThumbnail(file.buffer);

    // Upload full image
    storageKey = getS3Key(userId, momentId, `full-${originalFilename}`);
    await uploadToS3(storageKey, processed.buffer, 'image/jpeg');

    // Upload thumbnail
    thumbnailKey = getS3Key(userId, momentId, `thumb-${originalFilename}`);
    await uploadToS3(thumbnailKey, thumbnail, 'image/jpeg');

    width = processed.width;
    height = processed.height;
  } else if (fileType === 'video') {
    // For videos, just upload as-is for now
    // TODO: Add video processing with FFmpeg
    storageKey = getS3Key(userId, momentId, originalFilename);
    await uploadToS3(storageKey, file.buffer, file.mimetype);
  } else {
    throw new Error('Unsupported file type');
  }

  // Save to database
  const mediaFile = await prisma.mediaFile.create({
    data: {
      momentId,
      fileType,
      originalFilename: file.originalname,
      storageKey,
      thumbnailKey,
      fileSize: file.size,
      mimeType: file.mimetype,
      width,
      height,
      orderIndex,
    },
  });

  // Transform to include URLs
  return {
    ...mediaFile,
    url: `http://localhost:9000/${BUCKET_NAME}/${storageKey}`,
    thumbnailUrl: thumbnailKey ? `http://localhost:9000/${BUCKET_NAME}/${thumbnailKey}` : null,
    fileName: originalFilename,
  };
}

/**
 * Helper to transform media file to include URLs
 */
export function transformMediaFile(mediaFile: any) {
  return {
    ...mediaFile,
    url: `http://localhost:9000/${BUCKET_NAME}/${mediaFile.storageKey}`,
    thumbnailUrl: mediaFile.thumbnailKey
      ? `http://localhost:9000/${BUCKET_NAME}/${mediaFile.thumbnailKey}`
      : null,
    fileName: mediaFile.originalFilename,
  };
}

/**
 * Get all media files for a moment
 */
export async function getMomentMedia(momentId: string) {
  const mediaFiles = await prisma.mediaFile.findMany({
    where: {
      momentId,
    },
    orderBy: {
      orderIndex: 'asc',
    },
  });

  return mediaFiles.map(transformMediaFile);
}

/**
 * Delete media file
 */
export async function deleteMediaFile(mediaFileId: string, userId: string) {
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: mediaFileId },
    include: {
      moment: true,
    },
  });

  if (!mediaFile) {
    throw new Error('Media file not found');
  }

  if (mediaFile.moment.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete from S3
  await deleteFromS3(mediaFile.storageKey);
  if (mediaFile.thumbnailKey) {
    await deleteFromS3(mediaFile.thumbnailKey);
  }

  // Delete from database
  await prisma.mediaFile.delete({
    where: { id: mediaFileId },
  });
}

/**
 * Get signed URL for private file access (if needed in future)
 */
export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
