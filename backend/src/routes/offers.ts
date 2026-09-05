import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireKyc, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/offerService';

const router = Router();
router.use(requireAuth);

const OfferSchema = z.object({ price: z.number().positive(), currency: z.string().length(3), timelineDays: z.number().int().min(1).max(365), proposal: z.string().min(5).max(4000), experience: z.string().max(2000).optional() });
const SubmitSchema = z.object({ evidence: z.string().min(1).max(4000) });

router.post('/tasks/:taskId/offers', requireKyc, validateBody(OfferSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.submitOffer(req.user!.id, req.params.taskId, req.body)); } catch (e) { next(e); }
});
router.delete('/offers/:id', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.withdrawOffer(req.user!.id, req.params.id)); } catch (e) { next(e); }
});
router.post('/offers/:id/accept', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.acceptOffer(req.user!.id, req.params.id)); } catch (e) { next(e); }
});
router.post('/offers/:id/reject', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.rejectOffer(req.user!.id, req.params.id)); } catch (e) { next(e); }
});
router.get('/tasks/:taskId/offers', async (req: AuthedRequest, res, next) => {
  try { res.json({ offers: await svc.listOffersForTask(req.user!.id, req.params.taskId) }); } catch (e) { next(e); }
});
router.get('/offers/mine', async (req: AuthedRequest, res, next) => {
  try { res.json({ offers: await svc.myOffers(req.user!.id) }); } catch (e) { next(e); }
});

router.post('/tasks/:taskId/start', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.startWork(req.user!.id, req.params.taskId)); } catch (e) { next(e); }
});
router.post('/tasks/:taskId/submit', validateBody(SubmitSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.submitCompletion(req.user!.id, req.params.taskId, req.body.evidence)); } catch (e) { next(e); }
});
router.post('/tasks/:taskId/confirm', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.confirmCompletion(req.user!.id, req.params.taskId)); } catch (e) { next(e); }
});

export default router;