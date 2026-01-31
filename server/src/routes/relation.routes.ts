import { Router } from 'express';
import { createRelationController, deleteRelationController } from '../controllers/relation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createRelationController);
router.delete('/:momentId/:relatedMomentId', deleteRelationController);

export default router;
