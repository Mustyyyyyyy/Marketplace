import { PrismaClient, TaskStatus } from '@prisma/client';
import { badRequest, notFound, forbidden, conflict } from '../errors';
import { releaseHirePayment } from './paymentService';

const prisma = new PrismaClient();

export async function createReview(authorId: string, taskId: string, rating: number, body: string) {
  if (rating < 1 || rating > 5) throw badRequest('Rating must be 1-5');
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { hires: true } });
  if (!task) throw notFound();
  if (task.status !== TaskStatus.CUSTOMER_REVIEW && task.status !== TaskStatus.COMPLETED) throw badRequest('Task not eligible for review yet');

  const hire = await prisma.hire.findFirst({ where: { taskId } });
  if (!hire) throw badRequest('No hire on this task');

  // Determine author/target
  let targetId: string;
  if (authorId === task.customerId) {
    targetId = hire.taskerId;
  } else if (authorId === hire.taskerId) {
    targetId = task.customerId;
  } else {
    throw forbidden('Only participants can review');
  }

  const existing = await prisma.review.findUnique({ where: { taskId } });
  if (existing) throw conflict('A review already exists for this task');

  const review = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({ data: { taskId, authorId, targetId, rating, body, verified: true } });
    // Recompute target rating
    const agg = await tx.review.aggregate({ where: { targetId }, _avg: { rating: true }, _count: { rating: true } });
    if (targetId === hire.taskerId) {
      await tx.taskerProfile.update({ where: { userId: targetId }, data: { ratingAvg: agg._avg.rating || 0, ratingCount: agg._count.rating } });
    } else {
      await tx.customerProfile.update({ where: { userId: targetId }, data: { ratingAvg: agg._avg.rating || 0, ratingCount: agg._count.rating } });
    }
    // After review, mark task COMPLETED
    await tx.task.update({ where: { id: taskId }, data: { status: TaskStatus.COMPLETED } });
    await tx.hire.update({ where: { id: hire.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
    return review;
  });
  await releaseHirePayment(hire.id);
  return review;
}

export async function flagReview(targetId: string, reviewId: string) {
  const r = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!r) throw notFound();
  if (r.targetId !== targetId) throw forbidden();
  await prisma.review.update({ where: { id: reviewId }, data: { flagged: true } });
  return { ok: true };
}

export async function listReviewsForUser(userId: string) {
  return prisma.review.findMany({ where: { targetId: userId }, orderBy: { createdAt: 'desc' }, take: 50, include: { author: { select: { id: true, displayName: true, avatarUrl: true } } } });
}