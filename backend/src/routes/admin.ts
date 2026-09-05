// Admin API — every endpoint an admin or support agent might need.
// Auth: requireAuth + requireRole(ADMIN, SUPPORT) on the whole router.
// Per-route: requireCapability(<capability>) for fine-grained control.

import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from '../middleware/validate';
import { requireAuth, requireRole, requireCapability, AuthedRequest } from '../middleware/auth';
import * as svc from '../services/adminService';
import { UserStatus, Role, KycStatus, KycSubmissionStatus, TaskStatus, DisputeStatus } from '@prisma/client';
import { CAPABILITIES } from '../admin/capabilities';
import { withRetry } from '../db';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'SUPPORT'));

// =====================================================================
// Bootstrap: return the actor's role, capabilities, and a quick profile
// =====================================================================

router.get('/me', async (req: AuthedRequest, res, next) => {
  try {
    const ctx = await svc.loadActorContext(req.user!.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    res.json({
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        displayName: ctx.user.displayName,
        role: ctx.user.role,
        avatarUrl: ctx.user.avatarUrl,
        country: ctx.user.country,
      },
      capabilities: ctx.capabilities,
    });
  } catch (e) { next(e); }
});

// =====================================================================
// Users
// =====================================================================

const ListUsersSchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
  country: z.string().length(2).optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  sort: z.enum(['createdAt', 'lastLoginAt', 'email', 'riskScore']).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
});

router.get('/users', requireCapability(CAPABILITIES.USERS_VIEW), validateQuery(ListUsersSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.listUsers((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.get('/users/:id', requireCapability(CAPABILITIES.USERS_VIEW), async (req: AuthedRequest, res, next) => {
  try { res.json({ user: await svc.getUserDetail(req.params.id) }); } catch (e) { next(e); }
});

router.post('/users/:id/status', requireCapability(CAPABILITIES.USERS_BAN), validateBody(z.object({ status: z.nativeEnum(UserStatus), reason: z.string().optional() })), async (req: AuthedRequest, res, next) => {
  try {
    if (req.body.status === UserStatus.BANNED) {
      res.json(await svc.banUser(req.params.id, req.body.reason || 'banned by admin', req.user!.id));
    } else if (req.body.status === UserStatus.ACTIVE) {
      res.json(await svc.unbanUser(req.params.id, req.user!.id));
    } else {
      res.json(await svc.setUserStatus(req.params.id, req.body.status, req.user!.id));
    }
  } catch (e) { next(e); }
});

router.post('/users/:id/role', requireCapability(CAPABILITIES.USERS_CHANGE_ROLE), validateBody(z.object({ role: z.nativeEnum(Role) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.setUserRole(req.params.id, req.body.role, req.user!.id)); } catch (e) { next(e); }
});

router.post('/users/:id/kyc-override', requireCapability(CAPABILITIES.KYC_OVERRIDE), validateBody(z.object({ status: z.nativeEnum(KycStatus), reason: z.string().optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.forceKyc(req.params.id, req.body.status, req.body.reason || null, req.user!.id)); } catch (e) { next(e); }
});

router.post('/users/:id/impersonate', requireCapability(CAPABILITIES.USERS_IMPERSONATE), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.impersonateUser(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

router.get('/users/:id/notes', requireCapability(CAPABILITIES.USERS_VIEW), async (req: AuthedRequest, res, next) => {
  try { res.json({ notes: await svc.listAdminNotes(req.params.id) }); } catch (e) { next(e); }
});

router.post('/users/:id/notes', requireCapability(CAPABILITIES.USERS_NOTE), validateBody(z.object({ body: z.string().min(1).max(4000) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.addAdminNote(req.params.id, req.body.body, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// KYC
// =====================================================================

const ListKycSchema = z.object({
  status: z.nativeEnum(KycSubmissionStatus).optional(),
  country: z.string().length(2).optional(),
  mode: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

router.get('/kyc/submissions', requireCapability(CAPABILITIES.KYC_VIEW), validateQuery(ListKycSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.listKycSubmissions((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.post('/kyc/submissions/:id/review', requireCapability(CAPABILITIES.KYC_REVIEW), validateBody(z.object({ action: z.enum(['approve', 'reject']), reason: z.string().optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.reviewKycSubmission(req.params.id, req.body.action, req.body.reason || null, req.user!.id)); } catch (e) { next(e); }
});

router.get('/kyc/funnel', requireCapability(CAPABILITIES.KYC_VIEW), async (_req, res, next) => {
  try { res.json(await svc.kycFunnel()); } catch (e) { next(e); }
});

// =====================================================================
// Tasks
// =====================================================================

const ListTasksSchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  country: z.string().length(2).optional(),
  customerId: z.string().optional(),
  taskerId: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

router.get('/tasks', requireCapability(CAPABILITIES.TASKS_VIEW), validateQuery(ListTasksSchema), async (req, res, next) => {
  try { res.json(await svc.listTasks((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.get('/tasks/:id', requireCapability(CAPABILITIES.TASKS_VIEW), async (req, res, next) => {
  try { res.json({ task: await svc.getTaskDetail(req.params.id) }); } catch (e) { next(e); }
});

router.post('/tasks/:id/cancel', requireCapability(CAPABILITIES.TASKS_CANCEL), validateBody(z.object({ reason: z.string().min(1).max(1000) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.forceCancelTask(req.params.id, req.body.reason, req.user!.id)); } catch (e) { next(e); }
});

router.post('/tasks/:id/complete', requireCapability(CAPABILITIES.TASKS_FORCE_COMPLETE), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.forceCompleteTask(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Disputes
// =====================================================================

const ListDisputesSchema = z.object({ status: z.nativeEnum(DisputeStatus).optional(), page: z.coerce.number().optional(), pageSize: z.coerce.number().optional() });

router.get('/disputes', requireCapability(CAPABILITIES.DISPUTES_VIEW), validateQuery(ListDisputesSchema), async (req, res, next) => {
  try { res.json(await svc.listDisputes((req as any).validatedQuery)); } catch (e) { next(e); }
});

router.get('/disputes/:id', requireCapability(CAPABILITIES.DISPUTES_VIEW), async (req, res, next) => {
  try { res.json({ dispute: await svc.getDispute(req.params.id) }); } catch (e) { next(e); }
});

router.post('/disputes/:id/resolve', requireCapability(CAPABILITIES.DISPUTES_RESOLVE), validateBody(z.object({ resolution: z.enum(['customer', 'tasker', 'split', 'closed']), notes: z.string().min(1).max(4000) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.resolveDispute(req.params.id, req.body.resolution, req.body.notes, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Reports & reviews
// =====================================================================

router.get('/reports', requireCapability(CAPABILITIES.REPORTS_VIEW), async (req, res, next) => {
  try { res.json(await svc.listReports({ page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 20 })); } catch (e) { next(e); }
});

router.post('/reports/:id/action', requireCapability(CAPABILITIES.REPORTS_ACTION), validateBody(z.object({ action: z.enum(['dismiss', 'warn', 'ban', 'remove']) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.actionReport(req.params.id, req.body.action, req.user!.id)); } catch (e) { next(e); }
});

router.get('/message-reports', requireCapability(CAPABILITIES.REPORTS_VIEW), async (req, res, next) => {
  try { res.json(await svc.listMessageReports({ status: req.query.status as any, page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 20 })); } catch (e) { next(e); }
});

router.post('/message-reports/:id/action', requireCapability(CAPABILITIES.REPORTS_ACTION), validateBody(z.object({ action: z.enum(['dismiss', 'remove', 'ban']) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.actionMessageReport(req.params.id, req.body.action, req.user!.id)); } catch (e) { next(e); }
});

router.get('/reviews/flagged', requireCapability(CAPABILITIES.REVIEWS_MODERATE), async (req, res, next) => {
  try { res.json(await svc.listReviewsFlagged({ page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 20 })); } catch (e) { next(e); }
});

router.post('/reviews/:id/moderate', requireCapability(CAPABILITIES.REVIEWS_MODERATE), validateBody(z.object({ action: z.enum(['approve', 'remove']) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.moderateReview(req.params.id, req.body.action, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Categories
// =====================================================================

router.get('/categories', requireCapability(CAPABILITIES.CATEGORIES_VIEW), async (_req, res, next) => {
  try { res.json({ categories: await svc.listCategoriesForAdmin() }); } catch (e) { next(e); }
});

router.post('/categories', requireCapability(CAPABILITIES.CATEGORIES_EDIT), validateBody(z.object({ slug: z.string().min(1).max(60), name: z.string().min(1).max(120), icon: z.string().max(40).optional(), parentId: z.string().optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createCategory(req.body, req.user!.id)); } catch (e) { next(e); }
});

router.patch('/categories/:id', requireCapability(CAPABILITIES.CATEGORIES_EDIT), validateBody(z.object({ name: z.string().optional(), icon: z.string().optional(), parentId: z.string().nullable().optional(), active: z.boolean().optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.updateCategory(req.params.id, req.body, req.user!.id)); } catch (e) { next(e); }
});

router.delete('/categories/:id', requireCapability(CAPABILITIES.CATEGORIES_EDIT), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.deleteCategory(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Broadcasts
// =====================================================================

const BroadcastSchema = z.object({
  title: z.string().min(1).max(140),
  body: z.string().min(1).max(4000),
  audience: z.enum(['all', 'customers', 'taskers', 'kyc-pending', 'by-country']),
  country: z.string().length(2).optional(),
  channels: z.array(z.enum(['in_app', 'email', 'push'])).min(1),
});

router.get('/broadcasts', requireCapability(CAPABILITIES.BROADCASTS_VIEW), async (req, res, next) => {
  try { res.json(await svc.listBroadcasts({ status: req.query.status as any, page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 20 })); } catch (e) { next(e); }
});

router.post('/broadcasts', requireCapability(CAPABILITIES.BROADCASTS_SEND), validateBody(BroadcastSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createBroadcast(req.body, req.user!.id)); } catch (e) { next(e); }
});

router.post('/broadcasts/:id/send', requireCapability(CAPABILITIES.BROADCASTS_SEND), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.sendBroadcast(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Analytics
// =====================================================================

router.get('/analytics/overview', requireCapability(CAPABILITIES.ANALYTICS_VIEW), async (_req, res, next) => {
  try { res.json(await svc.analyticsOverview()); } catch (e) { next(e); }
});

router.get('/analytics/signups', requireCapability(CAPABILITIES.ANALYTICS_VIEW), async (req, res, next) => {
  try { res.json({ days: await svc.signupSeries(Number(req.query.days) || 30) }); } catch (e) { next(e); }
});

router.get('/analytics/tasks', requireCapability(CAPABILITIES.ANALYTICS_VIEW), async (req, res, next) => {
  try { res.json({ days: await svc.taskSeries(Number(req.query.days) || 30) }); } catch (e) { next(e); }
});

// =====================================================================
// Risk
// =====================================================================

router.get('/risk/events', requireCapability(CAPABILITIES.RISK_VIEW), async (req, res, next) => {
  try { res.json(await svc.listRiskEvents({ type: req.query.type as any, page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 20 })); } catch (e) { next(e); }
});

router.get('/risk/users', requireCapability(CAPABILITIES.RISK_VIEW), async (req, res, next) => {
  try { res.json({ users: await svc.highRiskUsers(Number(req.query.limit) || 20) }); } catch (e) { next(e); }
});

// =====================================================================
// Audit
// =====================================================================

const AuditSchema = z.object({
  actorId: z.string().optional(),
  action: z.string().optional(),
  target: z.string().optional(),
  since: z.coerce.date().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

router.get('/audit-logs', requireCapability(CAPABILITIES.AUDIT_VIEW), validateQuery(AuditSchema), async (req, res, next) => {
  try { res.json(await svc.listAuditLogs((req as any).validatedQuery)); } catch (e) { next(e); }
});

// =====================================================================
// Site settings
// =====================================================================

router.get('/settings', requireCapability(CAPABILITIES.SETTINGS_VIEW), async (_req, res, next) => {
  try { res.json(await svc.getSiteSettings()); } catch (e) { next(e); }
});

const SettingsPatchSchema = z.object({
  siteName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  defaultCountry: z.string().length(2).optional(),
  defaultCurrency: z.string().length(3).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().nullable().optional(),
  kycRequiredFor: z.enum(['all', 'taskers-only', 'off']).optional(),
  bannedEmailDomains: z.array(z.string()).optional(),
  featureFlags: z.record(z.string(), z.any()).optional(),
  termsUrl: z.string().url().nullable().optional(),
  privacyUrl: z.string().url().nullable().optional(),
});

router.patch('/settings', requireCapability(CAPABILITIES.SETTINGS_WRITE), validateBody(SettingsPatchSchema), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.updateSiteSettings(req.body, req.user!.id)); } catch (e) { next(e); }
});

// =====================================================================
// Admin management
// =====================================================================

router.get('/admins', requireCapability(CAPABILITIES.ADMINS_VIEW), async (_req, res, next) => {
  try { res.json({ admins: await svc.listAdmins() }); } catch (e) { next(e); }
});

router.post('/admins/:id/remove', requireCapability(CAPABILITIES.ADMINS_MANAGE), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.removeAdmin(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

router.get('/invites', requireCapability(CAPABILITIES.ADMINS_MANAGE), async (_req, res, next) => {
  try { res.json({ invites: await svc.listInvites() }); } catch (e) { next(e); }
});

router.post('/invites', requireCapability(CAPABILITIES.ADMINS_MANAGE), validateBody(z.object({ email: z.string().email().optional(), role: z.enum(['ADMIN', 'SUPPORT']), ttlDays: z.number().int().min(1).max(90).optional() })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.createInvite(req.body, req.user!.id)); } catch (e) { next(e); }
});

router.post('/invites/:id/revoke', requireCapability(CAPABILITIES.ADMINS_MANAGE), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.revokeInvite(req.params.id, req.user!.id)); } catch (e) { next(e); }
});

// Authed user accepts an invite by token — bumps their role.
router.post('/invites/accept', requireCapability(CAPABILITIES.ADMINS_MANAGE), validateBody(z.object({ token: z.string().min(10) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.acceptInvite(req.body.token, req.user!.id)); } catch (e) { next(e); }
});

router.get('/admins/:id/permissions', requireCapability(CAPABILITIES.ADMINS_MANAGE), async (req, res, next) => {
  try { res.json(await svc.getAdminPermissions(req.params.id)); } catch (e) { next(e); }
});

router.put('/admins/:id/permissions', requireCapability(CAPABILITIES.ADMINS_MANAGE), validateBody(z.object({ allow: z.array(z.string()), deny: z.array(z.string()) })), async (req: AuthedRequest, res, next) => {
  try { res.json(await svc.setAdminPermissions(req.params.id, req.body.allow, req.body.deny, req.user!.id)); } catch (e) { next(e); }
});

export default router;
