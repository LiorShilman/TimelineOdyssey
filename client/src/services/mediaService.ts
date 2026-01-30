import { api } from './api';
import type { MediaFile } from '../types/api.types';

/**
 * Upload media files to a moment
 */
export async function uploadMedia(
  momentId: string,
  files: File[]
): Promise<MediaFile[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<{ media: MediaFile[] }>(
    `/media/upload/${momentId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.media;
}

/**
 * Get media files for a moment
 */
export async function getMomentMedia(momentId: string): Promise<MediaFile[]> {
  const response = await api.get<MediaFile[]>(`/media/${momentId}`);
  return response.data;
}

/**
 * Delete a media file
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await api.delete(`/media/${mediaId}`);
}

export const mediaService = {
  uploadMedia,
  getMomentMedia,
  deleteMedia,
};
