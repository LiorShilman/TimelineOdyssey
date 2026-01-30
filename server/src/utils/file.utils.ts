import path from 'path';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../config/storage.config';

/**
 * Validate file type
 */
export function isValidFileType(mimetype: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimetype);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get S3 key for a file
 */
export function getS3Key(userId: string, momentId: string, filename: string): string {
  return `${userId}/${momentId}/${filename}`;
}

/**
 * Determine file type category
 */
export function getFileTypeCategory(mimetype: string): 'image' | 'video' | 'other' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'other';
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
