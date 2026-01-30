import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';
import {
  uploadMediaController,
  getMomentMediaController,
  deleteMediaController,
} from '../controllers/media.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Upload media files to a moment
router.post('/upload/:momentId', uploadMultiple, uploadMediaController);

// Get media files for a moment
router.get('/:momentId', getMomentMediaController);

// Delete a media file
router.delete('/:mediaId', deleteMediaController);

export default router;
