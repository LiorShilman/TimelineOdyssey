import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

/**
 * Get current user profile
 * GET /api/users/me
 */
export async function getCurrentUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'User not authenticated',
      });
    }

    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Update current user profile
 * PUT /api/users/me
 */
export async function updateCurrentUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'User not authenticated',
      });
    }

    const { firstName, lastName, avatarUrl } = req.body;

    const user = await authService.updateUserProfile(req.user.userId, {
      firstName,
      lastName,
      avatarUrl,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
