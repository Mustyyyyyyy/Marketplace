import { Router } from 'express';
import { prisma } from '../db';
import { getPublicTasker } from '../services/profileService';

const router = Router();

router.get('/taskers/:id', async (req, res, next) => {
  try { res.json(await getPublicTasker(req.params.id)); } catch (e) { next(e); }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const [tasksTotal, completed, taskersTotal, categoriesTotal, openTasks, reviews] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'TASKER' } }),
      prisma.category.count(),
      prisma.task.count({ where: { status: { in: ['PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'IN_PROGRESS', 'SUBMITTED', 'CUSTOMER_REVIEW'] } } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }).catch(() => ({ _avg: { rating: null }, _count: { _all: 0 } })),
    ]);
    res.json({
      tasksTotal, completedTasks: completed, taskersTotal, categoriesTotal, openTasks,
      ratingAvg: Number((reviews as any)?._avg?.rating ?? 0) || 0,
      reviewCount: (reviews as any)?._count?._all || 0,
    });
  } catch (e) { next(e); }
});

export default router;
