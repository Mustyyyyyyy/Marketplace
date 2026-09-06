import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, requireKyc, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/messageService';
import { HttpError } from '../errors';

const router = Router();
router.use(requireAuth);

const SendSchema = z.object({ body: z.string().max(4000).optional(), attachmentUrl: z.string().url().optional() });
const ReportSchema = z.object({ reason: z.string().min(2).max(120), details: z.string().max(2000).optional() });
const BlockSchema = z.object({ userId: z.string().min(1) });
const DirectSchema = z.object({ userId: z.string().min(1) });
const TaskConvSchema = z.object({ taskId: z.string().min(1), taskerId: z.string().min(1).optional() });

router.post('/conversations/task', validateBody(TaskConvSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.getOrCreateTaskConversation(req.user!.id, req.body.taskId, req.body.taskerId)); } catch (e) { next(e); }
});

router.post('/conversations/direct', validateBody(DirectSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.getOrCreateDirectConversation(req.user!.id, req.body.userId)); } catch (e) { next(e); }
});

router.get('/conversations', async (req: AuthedRequest, res, next) => {
  try { res.json({ conversations: await svc.listConversations(req.user!.id) }); } catch (e) { next(e); }
});

router.get('/conversations/:id/messages', async (req: AuthedRequest, res, next) => {
  try { res.json({ messages: await svc.getMessages(req.user!.id, req.params.id, req.query.before as string) }); } catch (e) { next(e); }
});

router.post('/conversations/:id/messages', requireKyc, validateBody(SendSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.sendMessage(req.user!.id, req.params.id, req.body.body || '', req.body.attachmentUrl)); } catch (e) { next(e); }
});

router.post('/conversations/:id/read', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.markRead(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.post('/messages/:id/report', validateBody(ReportSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.reportMessage(req.user!.id, req.params.id, req.body.reason, req.body.details)); } catch (e) { next(e); }
});

router.post('/blocks', validateBody(BlockSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.blockUser(req.user!.id, req.body.userId)); } catch (e) { next(e); }
});
router.delete('/blocks/:userId', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.unblockUser(req.user!.id, req.params.userId)); } catch (e) { next(e); }
});
router.get('/blocks', async (req: AuthedRequest, res, next) => {
  try { res.json({ blocks: await svc.listBlocks(req.user!.id) }); } catch (e) { next(e); }
});

export default router;