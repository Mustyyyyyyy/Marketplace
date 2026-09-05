import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();
router.use(requireAuth);

const PrefSchema = z.object({
  type: z.string().min(1).max(60),
  inApp: z.boolean().optional(),
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
});

router.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.notification.count({ where: { userId: req.user!.id, readAt: null } }),
    ]);
    res.json({ items, unread });
  } catch (e) { next(e); }
});

router.post('/:id/read', async (req: AuthedRequest, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/read-all', async (req: AuthedRequest, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/preferences', async (req: AuthedRequest, res, next) => {
  try { res.json({ preferences: await prisma.notificationPreference.findMany({ where: { userId: req.user!.id } }) }); } catch (e) { next(e); }
});

router.put('/preferences', validateBody(PrefSchema), async (req: AuthedRequest, res, next) => {
  try {
    const pref = await prisma.notificationPreference.upsert({
      where: { userId_type: { userId: req.user!.id, type: req.body.type } },
      update: { inApp: req.body.inApp, email: req.body.email, sms: req.body.sms, push: req.body.push },
      create: { userId: req.user!.id, type: req.body.type, inApp: req.body.inApp ?? true, email: req.body.email ?? true, sms: req.body.sms ?? false, push: req.body.push ?? true },
    });
    res.json(pref);
  } catch (e) { next(e); }
});

export default router;