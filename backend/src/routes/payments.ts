import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as svc from '../services/paymentService';

const router = Router();
const CheckoutSchema = z.object({ redirectUrl: z.string().url() });
const BankSchema = z.object({ bankCode: z.string().min(3).max(20), accountNumber: z.string().regex(/^\d{6,20}$/), country: z.string().length(2).default('GB') });
const PayoutSchema = z.object({ amount: z.number().positive(), currency: z.string().length(3), bankCode: z.string().min(3).max(20).optional(), accountNumber: z.string().regex(/^\d{6,20}$/).optional() });
router.post('/connect/onboarding', requireAuth, validateBody(BankSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createBankSetup(req.user!.id, req.body.bankCode, req.body.accountNumber, req.body.country)); } catch (e) { next(e); }
});
router.post('/hires/:hireId/intent', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createHirePayment(req.user!.id, req.params.hireId, String(req.body?.redirectUrl || ''))); } catch (e) { next(e); }
});
router.post('/hires/:hireId/checkout', requireAuth, validateBody(CheckoutSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createHireCheckout(req.user!.id, req.params.hireId, req.body.redirectUrl)); } catch (e) { next(e); }
});
router.get('/mine', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json({ payments: await svc.listPayments(req.user!.id) }); } catch (e) { next(e); }
});
router.get('/connect/status', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.getPayoutStatus(req.user!.id)); } catch (e) { next(e); }
});
router.get('/connect/banks/:country', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json({ banks: await svc.listBanks(req.params.country) }); } catch (e) { next(e); }
});
router.post('/connect/payout', requireAuth, validateBody(PayoutSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.requestPayout(req.user!.id, req.body.amount, req.body.currency, req.body.bankCode, req.body.accountNumber)); } catch (e) { next(e); }
});
router.post('/webhook', async (req, res, next) => {
  try { res.json(await svc.handleWebhook(req.body as Buffer, req.header('verif-hash') || '')); } catch (e) { next(e); }
});
router.get('/:paymentId', requireAuth, async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.getPayment(req.user!.id, req.params.paymentId)); } catch (e) { next(e); }
});
export default router;
