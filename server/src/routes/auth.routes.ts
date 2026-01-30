import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, registerController);
router.post('/login', authLimiter, loginController);
router.post('/refresh', authLimiter, refreshTokenController);

// Protected routes
router.post('/logout', authMiddleware, logoutController);

export default router;
