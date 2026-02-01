import type { Request, Response } from 'express';
import * as tagService from '../services/tag.service.js';

/**
 * Get all tags for the authenticated user
 */
export async function getTags(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const tags = await tagService.getUserTags(userId);

    return res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get tags'
    });
  }
}

/**
 * Create a new tag
 */
export async function createTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, color } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const tag = await tagService.createTag(userId, { name, color });

    return res.status(201).json({ tag });
  } catch (error) {
    console.error('Create tag error:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return res.status(409).json({ error: 'Tag with this name already exists' });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create tag'
    });
  }
}

/**
 * Update a tag
 */
export async function updateTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { tagId } = req.params;
    const { name, color } = req.body;

    const tag = await tagService.updateTag(tagId, userId, { name, color });

    return res.json({ tag });
  } catch (error) {
    console.error('Update tag error:', error);

    if (error instanceof Error && error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update tag'
    });
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { tagId } = req.params;

    await tagService.deleteTag(tagId, userId);

    return res.status(204).send();
  } catch (error) {
    console.error('Delete tag error:', error);

    if (error instanceof Error && error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete tag'
    });
  }
}

/**
 * Attach tag to moment
 */
export async function attachTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { momentId, tagId } = req.body;

    if (!momentId || !tagId) {
      return res.status(400).json({ error: 'momentId and tagId are required' });
    }

    await tagService.attachTagToMoment(momentId, tagId, userId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Attach tag error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to attach tag'
    });
  }
}

/**
 * Detach tag from moment
 */
export async function detachTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { momentId, tagId } = req.params;

    await tagService.detachTagFromMoment(momentId, tagId, userId);

    return res.status(204).send();
  } catch (error) {
    console.error('Detach tag error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to detach tag'
    });
  }
}

/**
 * Get moments by tag
 */
export async function getMomentsByTag(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { tagId } = req.params;

    const moments = await tagService.getMomentsByTag(tagId, userId);

    return res.json({ moments });
  } catch (error) {
    console.error('Get moments by tag error:', error);

    if (error instanceof Error && error.message === 'Tag not found') {
      return res.status(404).json({ error: 'Tag not found' });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get moments'
    });
  }
}
