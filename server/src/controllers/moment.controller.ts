import { Request, Response, NextFunction } from 'express';
import * as momentService from '../services/moment.service.js';

/**
 * Create a new moment
 * POST /api/moments
 */
export async function createMomentController(
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

    const { title, description, momentDate, emotion, importance, locationName, locationLat, locationLng, isDraft } = req.body;

    // Validate required fields
    if (!title || !momentDate) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and momentDate are required',
      });
    }

    const moment = await momentService.createMoment(req.user.userId, {
      title,
      description,
      momentDate: new Date(momentDate),
      emotion,
      importance,
      locationName,
      locationLat,
      locationLng,
      isDraft,
    });

    res.status(201).json({
      message: 'Moment created successfully',
      data: moment,
    });
  } catch (error: any) {
    if (error.message.includes('Invalid emotion') || error.message.includes('Importance must')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Get all moments for current user
 * GET /api/moments
 */
export async function getMomentsController(
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

    const { emotion, importance, startDate, endDate, includeDeleted } = req.query;

    const moments = await momentService.getMoments(req.user.userId, {
      emotion: emotion as string,
      importance: importance ? parseInt(importance as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeDeleted: includeDeleted === 'true',
    });

    res.status(200).json({
      data: moments,
      count: moments.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single moment by ID
 * GET /api/moments/:id
 */
export async function getMomentByIdController(
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

    const { id } = req.params;

    const moment = await momentService.getMomentById(id, req.user.userId);

    res.status(200).json({
      data: moment,
    });
  } catch (error: any) {
    if (error.message === 'Moment not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Update a moment
 * PUT /api/moments/:id
 */
export async function updateMomentController(
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

    const { id } = req.params;
    const { title, description, momentDate, emotion, importance, locationName, locationLat, locationLng, isDraft } = req.body;

    const moment = await momentService.updateMoment(id, req.user.userId, {
      title,
      description,
      momentDate: momentDate ? new Date(momentDate) : undefined,
      emotion,
      importance,
      locationName,
      locationLat,
      locationLng,
      isDraft,
    });

    res.status(200).json({
      message: 'Moment updated successfully',
      data: moment,
    });
  } catch (error: any) {
    if (error.message === 'Moment not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    if (error.message.includes('Invalid emotion') || error.message.includes('Importance must')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Soft delete a moment
 * DELETE /api/moments/:id
 */
export async function deleteMomentController(
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

    const { id } = req.params;

    await momentService.deleteMoment(id, req.user.userId);

    res.status(200).json({
      message: 'Moment deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Moment not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Restore a deleted moment
 * POST /api/moments/:id/restore
 */
export async function restoreMomentController(
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

    const { id } = req.params;

    const moment = await momentService.restoreMoment(id, req.user.userId);

    res.status(200).json({
      message: 'Moment restored successfully',
      data: moment,
    });
  } catch (error: any) {
    if (error.message === 'Deleted moment not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Get moment statistics
 * GET /api/moments/stats
 */
export async function getMomentStatsController(
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

    const stats = await momentService.getMomentStats(req.user.userId);

    res.status(200).json({
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
