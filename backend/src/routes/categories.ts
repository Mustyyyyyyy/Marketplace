import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import * as svc from '../services/categoryService';

const router = Router();

router.get('/', async (_req, res, next) => {
  try { res.json({ categories: await svc.listCategories() }); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try { res.json(await svc.getCategoryOrThrow(req.params.id)); } catch (e) { next(e); }
});

const CreateSchema = z.object({ name: z.string().min(1).max(80), slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/), icon: z.string().max(40).optional(), parentId: z.string().optional() });
router.post('/', requireAuth, requireRole('ADMIN'), validateBody(CreateSchema), async (req, res, next) => {
  try { res.status(201).json(await svc.createCategory(req.body)); } catch (e) { next(e); }
});

const UpdateSchema = z.object({ name: z.string().min(1).max(80).optional(), icon: z.string().max(40).optional(), active: z.boolean().optional(), parentId: z.string().nullable().optional() });
router.patch('/:id', requireAuth, requireRole('ADMIN'), validateBody(UpdateSchema), async (req, res, next) => {
  try { res.json(await svc.updateCategory(req.params.id, req.body)); } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try { res.json(await svc.deleteCategory(req.params.id)); } catch (e) { next(e); }
});

export default router;