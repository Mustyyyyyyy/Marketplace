import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from '../middleware/validate';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/adminService';
import { UserStatus, Role } from '@prisma/client';
import { logAudit } from '../services/adminService';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'SUPPORT'));

router.get('/users', validateQuery(z.object({ q: z.string().optional(), role: z.nativeEnum(Role).optional(), status: z.nativeEnum(UserStatus).optional(), page: z.coerce.number().optional(), pageSize: z.coerce.number().optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.listUsers((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.post('/users/:id/status', validateBody(z.object({ status: z.nativeEnum(UserStatus) })), async (req: AuthedRequest, res, next) => {
  try {
    const u = await svc.setUserStatus(req.params.id, req.body.status);
    await logAudit(req.user!.id, 'user.status.update', req.params.id, { status: req.body.status }, req.ip);
    res.json(u);
  } catch (e) { next(e); }
});

router.get('/tasks', validateQuery(z.object({ status: z.string().optional(), q: z.string().optional(), page: z.coerce.number().optional(), pageSize: z.coerce.number().optional() })), async (req, res, next) => {
  try { res.json(await svc.listTasks((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.get('/reports', async (_req, res, next) => { try { res.json({ reports: await svc.listReports() }); } catch (e) { next(e); } });
router.get('/message-reports', async (_req, res, next) => { try { res.json({ reports: await svc.listMessageReports() }); } catch (e) { next(e); } });
router.get('/reviews/flagged', async (_req, res, next) => { try { res.json({ reviews: await svc.listReviewsFlagged() }); } catch (e) { next(e); } });
router.post('/reviews/:id/moderate', validateBody(z.object({ action: z.enum(['approve', 'remove']) })), async (req, res, next) => { try { res.json(await svc.moderateReview(req.params.id, req.body.action)); } catch (e) { next(e); } });

router.get('/risk-events', async (_req, res, next) => { try { res.json({ events: await svc.listRiskEvents() }); } catch (e) { next(e); } });
router.get('/audit-logs', async (_req, res, next) => { try { res.json({ logs: await svc.listAuditLogs() }); } catch (e) { next(e); } });
router.get('/analytics', async (_req, res, next) => { try { res.json(await svc.analytics()); } catch (e) { next(e); } });

export default router;