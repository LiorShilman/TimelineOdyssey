import { Router } from 'express';
import {
  getCurrentUserController,
  updateCurrentUserController,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/me', getCurrentUserController);
router.put('/me', updateCurrentUserController);

export default router;
