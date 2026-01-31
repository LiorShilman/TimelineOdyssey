import prisma from '../config/database.config.js';
import logger from '../utils/logger.utils.js';
import { Prisma } from '@prisma/client';
import { transformMediaFile } from './media.service.js';

export interface CreateMomentInput {
  title: string;
  description?: string;
  momentDate: Date;
  emotion?: 'happy' | 'sad' | 'exciting' | 'nostalgic' | 'neutral';
  importance?: number; // 1-5
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  isDraft?: boolean;
  flagged?: boolean;
}

export interface UpdateMomentInput {
  title?: string;
  description?: string;
  momentDate?: Date;
  emotion?: 'happy' | 'sad' | 'exciting' | 'nostalgic' | 'neutral';
  importance?: number;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  isDraft?: boolean;
  flagged?: boolean;
}

export interface GetMomentsFilters {
  emotion?: string;
  importance?: number;
  startDate?: Date;
  endDate?: Date;
  includeDeleted?: boolean;
}

/**
 * Create a new moment
 */
export async function createMoment(userId: string, input: CreateMomentInput) {
  // Validate emotion
  const validEmotions = ['happy', 'sad', 'exciting', 'nostalgic', 'neutral'];
  if (input.emotion && !validEmotions.includes(input.emotion)) {
    throw new Error(`Invalid emotion. Must be one of: ${validEmotions.join(', ')}`);
  }

  // Validate importance
  if (input.importance && (input.importance < 1 || input.importance > 5)) {
    throw new Error('Importance must be between 1 and 5');
  }

  const moment = await prisma.moment.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      momentDate: input.momentDate,
      emotion: input.emotion,
      importance: input.importance ?? 3,
      locationName: input.locationName,
      locationLat: input.locationLat ? new Prisma.Decimal(input.locationLat.toString()) : null,
      locationLng: input.locationLng ? new Prisma.Decimal(input.locationLng.toString()) : null,
      isDraft: input.isDraft ?? false,
      flagged: input.flagged ?? false,
    },
    include: {
      mediaFiles: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  logger.info(`Moment created: ${moment.id} by user ${userId}`);

  return moment;
}

/**
 * Get all moments for a user
 */
export async function getMoments(userId: string, filters?: GetMomentsFilters) {
  const where: Prisma.MomentWhereInput = {
    userId,
  };

  // Filter by deleted status
  if (!filters?.includeDeleted) {
    where.deletedAt = null;
  }

  // Filter by emotion
  if (filters?.emotion) {
    where.emotion = filters.emotion;
  }

  // Filter by importance
  if (filters?.importance) {
    where.importance = filters.importance;
  }

  // Filter by date range
  if (filters?.startDate || filters?.endDate) {
    where.momentDate = {};
    if (filters.startDate) {
      where.momentDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.momentDate.lte = filters.endDate;
    }
  }

  const moments = await prisma.moment.findMany({
    where,
    include: {
      mediaFiles: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      relations: {
        include: {
          relatedMoment: {
            select: {
              id: true,
              title: true,
              momentDate: true,
              emotion: true,
            },
          },
        },
      },
    },
    orderBy: {
      momentDate: 'desc',
    },
  });

  // Transform media files to include URLs
  return moments.map((moment) => ({
    ...moment,
    mediaFiles: moment.mediaFiles.map(transformMediaFile),
  }));
}

/**
 * Get a single moment by ID
 */
export async function getMomentById(momentId: string, userId: string) {
  const moment = await prisma.moment.findFirst({
    where: {
      id: momentId,
      userId,
    },
    include: {
      mediaFiles: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      relations: {
        include: {
          relatedMoment: {
            select: {
              id: true,
              title: true,
              momentDate: true,
              emotion: true,
            },
          },
        },
      },
    },
  });

  if (!moment) {
    throw new Error('Moment not found');
  }

  // Transform media files to include URLs
  return {
    ...moment,
    mediaFiles: moment.mediaFiles.map(transformMediaFile),
  };
}

/**
 * Update a moment
 */
export async function updateMoment(
  momentId: string,
  userId: string,
  input: UpdateMomentInput
) {
  // Check if moment exists and belongs to user
  const existingMoment = await prisma.moment.findFirst({
    where: {
      id: momentId,
      userId,
    },
  });

  if (!existingMoment) {
    throw new Error('Moment not found');
  }

  // Validate emotion
  if (input.emotion) {
    const validEmotions = ['happy', 'sad', 'exciting', 'nostalgic', 'neutral'];
    if (!validEmotions.includes(input.emotion)) {
      throw new Error(`Invalid emotion. Must be one of: ${validEmotions.join(', ')}`);
    }
  }

  // Validate importance
  if (input.importance && (input.importance < 1 || input.importance > 5)) {
    throw new Error('Importance must be between 1 and 5');
  }

  const updatedMoment = await prisma.moment.update({
    where: {
      id: momentId,
    },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.momentDate && { momentDate: input.momentDate }),
      ...(input.emotion && { emotion: input.emotion }),
      ...(input.importance && { importance: input.importance }),
      ...(input.locationName !== undefined && { locationName: input.locationName }),
      ...(input.locationLat !== undefined && {
        locationLat: input.locationLat ? new Prisma.Decimal(input.locationLat.toString()) : null,
      }),
      ...(input.locationLng !== undefined && {
        locationLng: input.locationLng ? new Prisma.Decimal(input.locationLng.toString()) : null,
      }),
      ...(input.isDraft !== undefined && { isDraft: input.isDraft }),
      ...(input.flagged !== undefined && { flagged: input.flagged }),
    },
    include: {
      mediaFiles: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  logger.info(`Moment updated: ${momentId} by user ${userId}`);

  return updatedMoment;
}

/**
 * Soft delete a moment
 */
export async function deleteMoment(momentId: string, userId: string) {
  // Check if moment exists and belongs to user
  const existingMoment = await prisma.moment.findFirst({
    where: {
      id: momentId,
      userId,
    },
  });

  if (!existingMoment) {
    throw new Error('Moment not found');
  }

  const deletedMoment = await prisma.moment.update({
    where: {
      id: momentId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  logger.info(`Moment soft deleted: ${momentId} by user ${userId}`);

  return deletedMoment;
}

/**
 * Restore a deleted moment
 */
export async function restoreMoment(momentId: string, userId: string) {
  // Check if moment exists, belongs to user, and is deleted
  const existingMoment = await prisma.moment.findFirst({
    where: {
      id: momentId,
      userId,
      deletedAt: {
        not: null,
      },
    },
  });

  if (!existingMoment) {
    throw new Error('Deleted moment not found');
  }

  const restoredMoment = await prisma.moment.update({
    where: {
      id: momentId,
    },
    data: {
      deletedAt: null,
    },
    include: {
      mediaFiles: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  logger.info(`Moment restored: ${momentId} by user ${userId}`);

  return restoredMoment;
}

/**
 * Permanently delete a moment (use with caution)
 */
export async function permanentlyDeleteMoment(momentId: string, userId: string) {
  // Check if moment exists and belongs to user
  const existingMoment = await prisma.moment.findFirst({
    where: {
      id: momentId,
      userId,
    },
  });

  if (!existingMoment) {
    throw new Error('Moment not found');
  }

  await prisma.moment.delete({
    where: {
      id: momentId,
    },
  });

  logger.warn(`Moment permanently deleted: ${momentId} by user ${userId}`);
}

/**
 * Get moment statistics for a user
 */
export async function getMomentStats(userId: string) {
  const [total, byEmotionArray, byImportanceArray] = await Promise.all([
    // Total moments (excluding deleted)
    prisma.moment.count({
      where: {
        userId,
        deletedAt: null,
      },
    }),

    // Group by emotion
    prisma.moment.groupBy({
      by: ['emotion'],
      where: {
        userId,
        deletedAt: null,
      },
      _count: true,
    }),

    // Group by importance
    prisma.moment.groupBy({
      by: ['importance'],
      where: {
        userId,
        deletedAt: null,
      },
      _count: true,
    }),
  ]);

  // Transform arrays to objects
  const byEmotion: Record<string, number> = {};
  byEmotionArray.forEach((item) => {
    if (item.emotion) {
      byEmotion[item.emotion] = item._count;
    }
  });

  const byImportance: Record<number, number> = {};
  byImportanceArray.forEach((item) => {
    if (item.importance) {
      byImportance[item.importance] = item._count;
    }
  });

  return {
    total,
    byEmotion,
    byImportance,
  };
}
