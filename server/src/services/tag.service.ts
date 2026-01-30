import prisma from '../config/database.config.js';
import type { Tag, MomentTag } from '@prisma/client';

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface AttachTagDto {
  momentId: string;
  tagId: string;
}

/**
 * Get all tags for a user
 */
export async function getUserTags(userId: string): Promise<Tag[]> {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { moments: true }
      }
    }
  });
}

/**
 * Create a new tag
 */
export async function createTag(userId: string, data: CreateTagDto): Promise<Tag> {
  return prisma.tag.create({
    data: {
      userId,
      name: data.name.trim(),
      color: data.color || generateRandomColor()
    }
  });
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, userId: string, data: Partial<CreateTagDto>): Promise<Tag> {
  // Verify ownership
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId }
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  return prisma.tag.update({
    where: { id: tagId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.color && { color: data.color })
    }
  });
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string, userId: string): Promise<void> {
  // Verify ownership
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId }
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  await prisma.tag.delete({
    where: { id: tagId }
  });
}

/**
 * Attach tag to moment
 */
export async function attachTagToMoment(momentId: string, tagId: string, userId: string): Promise<void> {
  // Verify moment ownership
  const moment = await prisma.moment.findFirst({
    where: { id: momentId, userId }
  });

  if (!moment) {
    throw new Error('Moment not found');
  }

  // Verify tag ownership
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId }
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  // Create the relation (ignore if already exists)
  await prisma.momentTag.create({
    data: {
      momentId,
      tagId
    }
  }).catch(() => {
    // Ignore unique constraint violation
  });
}

/**
 * Detach tag from moment
 */
export async function detachTagFromMoment(momentId: string, tagId: string, userId: string): Promise<void> {
  // Verify moment ownership
  const moment = await prisma.moment.findFirst({
    where: { id: momentId, userId }
  });

  if (!moment) {
    throw new Error('Moment not found');
  }

  await prisma.momentTag.delete({
    where: {
      momentId_tagId: {
        momentId,
        tagId
      }
    }
  }).catch(() => {
    // Ignore if relation doesn't exist
  });
}

/**
 * Get moments by tag
 */
export async function getMomentsByTag(tagId: string, userId: string) {
  // Verify tag ownership
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId }
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  const momentTags = await prisma.momentTag.findMany({
    where: { tagId },
    include: {
      moment: {
        include: {
          mediaFiles: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }
    }
  });

  return momentTags.map(mt => mt.moment);
}

/**
 * Generate random color for tag
 */
function generateRandomColor(): string {
  const colors = [
    '#FF6347', // Tomato
    '#FFD700', // Gold
    '#9370DB', // Medium Purple
    '#4169E1', // Royal Blue
    '#32CD32', // Lime Green
    '#FF69B4', // Hot Pink
    '#FFA500', // Orange
    '#00CED1', // Dark Turquoise
    '#FF1493', // Deep Pink
    '#7FFF00', // Chartreuse
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
