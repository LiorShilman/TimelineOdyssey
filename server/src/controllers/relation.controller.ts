import { Request, Response, NextFunction } from 'express';
import * as relationService from '../services/relation.service.js';

const VALID_RELATION_TYPES = ['same_people', 'same_location', 'same_event'];

/**
 * Create a relation between two moments
 * POST /api/relations
 */
export async function createRelationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication Error', message: 'User not authenticated' });
    }

    const { momentId, relatedMomentId, relationType } = req.body;

    if (!momentId || !relatedMomentId || !relationType) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'momentId, relatedMomentId, and relationType are required',
      });
    }

    if (!VALID_RELATION_TYPES.includes(relationType)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `relationType must be one of: ${VALID_RELATION_TYPES.join(', ')}`,
      });
    }

    await relationService.createRelation(req.user.userId, momentId, relatedMomentId, relationType);

    res.status(201).json({ message: 'Relation created successfully' });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('Cannot relate')) {
      return res.status(400).json({ error: 'Validation Error', message: error.message });
    }
    next(error);
  }
}

/**
 * Delete a relation between two moments
 * DELETE /api/relations/:momentId/:relatedMomentId
 */
export async function deleteRelationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication Error', message: 'User not authenticated' });
    }

    const { momentId, relatedMomentId } = req.params;

    await relationService.deleteRelation(req.user.userId, momentId, relatedMomentId);

    res.status(200).json({ message: 'Relation deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Moment not found') {
      return res.status(404).json({ error: 'Not Found', message: error.message });
    }
    next(error);
  }
}
