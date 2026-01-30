import { Router } from 'express';
import {
  createMomentController,
  getMomentsController,
  getMomentByIdController,
  updateMomentController,
  deleteMomentController,
  restoreMomentController,
  getMomentStatsController,
} from '../controllers/moment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All moment routes require authentication
router.use(authMiddleware);

// Stats endpoint must come before /:id to avoid treating 'stats' as an ID
router.get('/stats', getMomentStatsController);

// CRUD operations
router.post('/', createMomentController);
router.get('/', getMomentsController);
router.get('/:id', getMomentByIdController);
router.put('/:id', updateMomentController);
router.delete('/:id', deleteMomentController);

// Restore deleted moment
router.post('/:id/restore', restoreMomentController);

export default router;
