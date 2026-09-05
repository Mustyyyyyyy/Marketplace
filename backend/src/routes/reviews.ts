import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/reviewService';

const router = Router();
router.use(requireAuth);

const ReviewSchema = z.object({ rating: z.number().int().min(1).max(5), body: z.string().min(3).max(4000) });

router.post('/tasks/:taskId/review', validateBody(ReviewSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.createReview(req.user!.id, req.params.taskId, req.body.rating, req.body.body)); } catch (e) { next(e); }
});

router.post('/reviews/:id/flag', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.flagReview(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.get('/users/:id/reviews', async (req, res, next) => {
  try { res.json({ reviews: await svc.listReviewsForUser(req.params.id) }); } catch (e) { next(e); }
});

export default router;