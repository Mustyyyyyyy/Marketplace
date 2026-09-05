import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/trustService';
import { ReportTargetType, DisputeStatus } from '@prisma/client';

const router = Router();

const ReportSchema = z.object({ targetType: z.nativeEnum(ReportTargetType), targetId: z.string().min(1), reason: z.string().min(2).max(120), details: z.string().max(2000).optional(), targetUserId: z.string().optional(), taskId: z.string().optional() });
const DisputeSchema = z.object({ reason: z.string().min(2).max(120), details: z.string().min(5).max(4000) });
const KycSubmitSchema = z.object({ documentUrl: z.string().url(), notes: z.string().max(2000).optional() });
const KycReviewSchema = z.object({ approve: z.boolean(), notes: z.string().max(2000).optional() });
const SuspendSchema = z.object({ suspend: z.boolean() });

router.post('/reports', requireAuth, validateBody(ReportSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.fileReport(req.user!.id, req.body)); } catch (e) { next(e); }
});

router.post('/disputes/tasks/:taskId', requireAuth, validateBody(DisputeSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.openDispute(req.user!.id, req.params.taskId, req.body.reason, req.body.details)); } catch (e) { next(e); }
});

router.get('/disputes', requireAuth, requireRole('ADMIN', 'SUPPORT'), async (_req, res, next) => {
  try { res.json({ disputes: await svc.listDisputes() }); } catch (e) { next(e); }
});

router.get('/disputes/:id', requireAuth, requireRole('ADMIN', 'SUPPORT'), async (req, res, next) => {
  try { res.json(await svc.getDispute(req.params.id)); } catch (e) { next(e); }
});

router.post('/disputes/:id/status', requireAuth, requireRole('ADMIN', 'SUPPORT'), validateBody(z.object({ status: z.nativeEnum(DisputeStatus), resolution: z.string().max(2000).optional() })), async (req, res, next) => {
  try { res.json(await svc.updateDisputeStatus(req.params.id, req.body.status, req.body.resolution)); } catch (e) { next(e); }
});

router.post('/kyc/submit', requireAuth, validateBody(KycSubmitSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.submitKyc(req.user!.id, req.body)); } catch (e) { next(e); }
});

router.post('/admin/kyc/:userId/review', requireAuth, requireRole('ADMIN'), validateBody(KycReviewSchema), async (req, res, next) => {
  try { res.json(await svc.reviewKyc(req.params.userId, req.body.approve, req.body.notes)); } catch (e) { next(e); }
});

router.post('/admin/users/:id/suspend', requireAuth, requireRole('ADMIN'), validateBody(SuspendSchema), async (req, res, next) => {
  try { res.json(await svc.suspendUser(req.params.id, req.body.suspend)); } catch (e) { next(e); }
});

export default router;