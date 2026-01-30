import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Tag management
router.get('/', tagController.getTags);
router.post('/', tagController.createTag);
router.put('/:tagId', tagController.updateTag);
router.delete('/:tagId', tagController.deleteTag);

// Tag-moment relations
router.post('/attach', tagController.attachTag);
router.delete('/detach/:momentId/:tagId', tagController.detachTag);

// Get moments by tag
router.get('/:tagId/moments', tagController.getMomentsByTag);

export default router;
