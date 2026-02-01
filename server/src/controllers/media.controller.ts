import { Request, Response, NextFunction } from 'express';
import * as mediaService from '../services/media.service';

/**
 * Upload media files to a moment
 * POST /api/media/upload/:momentId
 */
export async function uploadMediaController(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  try {
    const { momentId } = req.params;
    const userId = req.user!.userId;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Upload all files
    const uploadedMedia = await Promise.all(
      files.map((file, index) =>
        mediaService.uploadMomentMedia(userId, momentId, file, index)
      )
    );

    return res.status(201).json({
      message: 'Files uploaded successfully',
      media: uploadedMedia,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload media',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

/**
 * Get media files for a moment
 * GET /api/media/:momentId
 */
export async function getMomentMediaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { momentId } = req.params;

    const media = await mediaService.getMomentMedia(momentId);

    return res.json(media);
  } catch (error: any) {
    return next(error);
  }
}

/**
 * Delete a media file
 * DELETE /api/media/:mediaId
 */
export async function deleteMediaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { mediaId } = req.params;
    const userId = req.user!.userId;

    await mediaService.deleteMediaFile(mediaId, userId);

    return res.json({ message: 'Media file deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Media file not found') {
      return res.status(404).json({ error: 'Not Found', message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'Forbidden', message: error.message });
    }
    return next(error);
  }
}
