import prisma from '../config/database.config.js';
import logger from '../utils/logger.utils.js';

/**
 * Create a bidirectional relation between two moments.
 * Both (A→B) and (B→A) rows are created so each moment's
 * `relations` include covers the full graph.
 */
export async function createRelation(
  userId: string,
  momentId: string,
  relatedMomentId: string,
  relationType: string
) {
  if (momentId === relatedMomentId) {
    throw new Error('Cannot relate a moment to itself');
  }

  // Verify both moments belong to the user and are not deleted
  const [momentA, momentB] = await Promise.all([
    prisma.moment.findFirst({ where: { id: momentId, userId, deletedAt: null } }),
    prisma.moment.findFirst({ where: { id: relatedMomentId, userId, deletedAt: null } }),
  ]);

  if (!momentA) throw new Error('Source moment not found');
  if (!momentB) throw new Error('Related moment not found');

  // Upsert both directions in a transaction
  await prisma.$transaction([
    prisma.momentRelation.upsert({
      where: { momentId_relatedMomentId: { momentId, relatedMomentId } },
      create: { momentId, relatedMomentId, relationType },
      update: { relationType },
    }),
    prisma.momentRelation.upsert({
      where: { momentId_relatedMomentId: { momentId: relatedMomentId, relatedMomentId: momentId } },
      create: { momentId: relatedMomentId, relatedMomentId: momentId, relationType },
      update: { relationType },
    }),
  ]);

  logger.info(`Relation created: ${momentId} <-> ${relatedMomentId} (${relationType})`);
}

/**
 * Delete a bidirectional relation between two moments.
 */
export async function deleteRelation(
  userId: string,
  momentId: string,
  relatedMomentId: string
) {
  const moment = await prisma.moment.findFirst({ where: { id: momentId, userId } });
  if (!moment) throw new Error('Moment not found');

  await prisma.$transaction([
    prisma.momentRelation.deleteMany({ where: { momentId, relatedMomentId } }),
    prisma.momentRelation.deleteMany({ where: { momentId: relatedMomentId, relatedMomentId: momentId } }),
  ]);

  logger.info(`Relation deleted: ${momentId} <-> ${relatedMomentId}`);
}
