import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/profileService';

const router = Router();
router.use(requireAuth);

const UpdateProfile = z.object({
  displayName: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(2000).optional(),
  country: z.string().length(2).optional(),
  locale: z.string().min(2).max(5).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().min(1).max(60).optional(),
});

const TaskerUpdate = z.object({
  bio: z.string().max(2000).optional(),
  headline: z.string().max(120).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  travelRadiusKm: z.number().int().min(0).max(500).optional(),
  remoteOk: z.boolean().optional(),
});

const SkillsSchema = z.object({ skills: z.array(z.string().min(1).max(60)).min(1).max(50) });
const CertSchema = z.object({ title: z.string().min(1).max(120), issuer: z.string().max(120).optional(), issuedAt: z.string().datetime().optional(), expiresAt: z.string().datetime().optional(), documentUrl: z.string().url().optional() });
const PortfolioSchema = z.object({ title: z.string().min(1).max(120), description: z.string().max(2000).optional(), mediaUrl: z.string().url().optional() });
const AvailabilitySchema = z.object({ windows: z.array(z.object({ weekday: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1440), endMinute: z.number().int().min(0).max(1440) })).max(50) });

router.get('/me', async (req: AuthedRequest, res, next) => {
  try { res.json({ profile: await svc.getMyProfile(req.user!.id) }); } catch (e) { next(e); }
});

router.patch('/me', validateBody(UpdateProfile), async (req: AuthedRequest, res, next) => {
  try { res.json({ user: await svc.updateMyProfile(req.user!.id, req.body) }); } catch (e) { next(e); }
});

const AvatarSchema = z.object({ avatarUrl: z.string().url(), avatarPublicId: z.string().optional() });
router.patch('/me/avatar', validateBody(AvatarSchema), async (req: AuthedRequest, res, next) => {
  try { res.json({ user: await svc.setMyAvatar(req.user!.id, req.body.avatarUrl, req.body.avatarPublicId) }); } catch (e) { next(e); }
});

router.patch('/tasker', validateBody(TaskerUpdate), async (req: AuthedRequest, res, next) => {
  try { res.json({ taskerProfile: await svc.updateTaskerProfile(req.user!.id, req.body) }); } catch (e) { next(e); }
});

router.put('/tasker/skills', validateBody(SkillsSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.setTaskerSkills(req.user!.id, req.body.skills)); } catch (e) { next(e); }
});

router.post('/tasker/certifications', validateBody(CertSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.addCertification(req.user!.id, req.body)); } catch (e) { next(e); }
});

router.delete('/tasker/certifications/:id', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.removeCertification(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.post('/tasker/portfolio', validateBody(PortfolioSchema), async (req: AuthedRequest, res, next) => {
  try { res.status(201).json(await svc.addPortfolioItem(req.user!.id, req.body)); } catch (e) { next(e); }
});

router.delete('/tasker/portfolio/:id', async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.removePortfolioItem(req.user!.id, req.params.id)); } catch (e) { next(e); }
});

router.put('/tasker/availability', validateBody(AvailabilitySchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.setAvailability(req.user!.id, req.body.windows)); } catch (e) { next(e); }
});

export default router;