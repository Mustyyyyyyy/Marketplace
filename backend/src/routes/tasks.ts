import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from '../middleware/validate';
import { requireAuth, requireKyc, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/taskService';
import { MediaKind } from '@prisma/client';

const router = Router();

const CreateSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(8000),
  categoryId: z.string().optional(),
  mode: z.enum(['LOCAL', 'REMOTE']),
  budgetType: z.enum(['FIXED', 'HOURLY']),
  budgetAmount: z.number().positive().max(1_000_000),
  currency: z.string().length(3),
  preferredAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  city: z.string().max(80).optional(),
  country: z.string().length(2).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  serviceRadiusKm: z.number().int().min(0).max(500).optional(),
});

const UpdateSchema = CreateSchema.partial();
const MediaSchema = z.object({ media: z.array(z.object({ url: z.string().url(), kind: z.enum(['IMAGE', 'VIDEO', 'FILE']) })) });
const ListSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  mode: z.enum(['LOCAL', 'REMOTE']).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  currency: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(['recent', 'budget_high', 'budget_low', 'relevance']).optional(),
});

router.post('/', requireAuth, requireKyc, validateBody(CreateSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.createTask(req.user!.id, req.body)); } catch (e) { next(e); }
});

router.patch('/:id', requireAuth, requireKyc, validateBody(UpdateSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.updateTask(req.user!.id, req.params.id, req.body)); } catch (e) { next(e); }
});

router.post('/:id/publish', requireAuth, requireKyc, async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.publishTask(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.post('/:id/cancel', requireAuth, requireKyc, async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.cancelTask(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.get('/', validateQuery(ListSchema), async (req, res, next) => {
  try { res.json(await svc.listTasks((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.get('/mine', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json({ tasks: await svc.listMyTasks(req.user!.id, req.query.status as any) }); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    // optional auth: attach viewer id if provided
    let viewerId: string | undefined;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try { const { verifyToken } = require('../utils/jwt'); const p = verifyToken(auth.slice(7)); viewerId = p.sub; } catch { /* ignore */ }
    }
    res.json(await svc.getTask(req.params.id, viewerId));
  } catch (e) { next(e); }
});

router.post('/:id/media', requireAuth, requireKyc, validateBody(MediaSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.addMedia(req.user!.id, req.params.id, req.body.media.map((m: any) => ({ ...m, kind: m.kind as MediaKind })))); } catch (e) { next(e); }
});

export default router;