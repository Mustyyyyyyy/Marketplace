// Admin service — every operation an admin or support agent can do on the
// platform. Capabilities are enforced by `requireCapability` middleware;
// the `can()` helper in admin/capabilities.ts is the single source of truth
// for role-based defaults + per-admin overrides.

import { PrismaClient, UserStatus, Role, KycStatus, KycSubmissionStatus, TaskStatus, DisputeStatus, Prisma } from '@prisma/client';
import { notFound, badRequest, forbidden, conflict } from '../errors';
import { withRetry } from '../db';
import { hashPassword } from '../utils/password';
import { randomToken } from '../utils/tokens';
import { signAccess } from '../utils/jwt';
import { effectiveCapabilities } from '../admin/capabilities';
import { sendEmail } from './emailService';

const prisma = new PrismaClient();

// =====================================================================
// Audit
// =====================================================================

export async function logAudit(actorId: string | null, action: string, target?: string, metadata?: any, ip?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || undefined,
        action,
        target,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        ip,
      },
    });
  } catch { /* never fail the request because of an audit-log write */ }
}

// =====================================================================
// Users
// =====================================================================

export async function listUsers(filters: {
  q?: string; role?: Role; status?: UserStatus;
  kycStatus?: KycStatus; country?: string;
  page?: number; pageSize?: number;
  sort?: 'createdAt' | 'lastLoginAt' | 'email' | 'riskScore';
  dir?: 'asc' | 'desc';
}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.UserWhereInput = {};
  if (filters.q) {
    where.OR = [
      { email: { contains: filters.q, mode: 'insensitive' } },
      { displayName: { contains: filters.q, mode: 'insensitive' } },
      { phone: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.kycStatus) where.kycStatus = filters.kycStatus;
  if (filters.country) where.country = filters.country.toUpperCase();

  const sortField = (filters.sort as any) || 'createdAt';
  const dir = filters.dir || 'desc';

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortField]: dir },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true, email: true, displayName: true, role: true, status: true,
        country: true, currency: true, kycStatus: true, kycCountry: true,
        riskScore: true, emailVerified: true, phoneVerified: true,
        avatarUrl: true, createdAt: true, lastLoginAt: true, updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
      taskerProfile: { include: { skills: { include: { skill: true } }, certifications: true, portfolioItems: true } },
      kycSubmissions: { orderBy: { submittedAt: 'desc' }, take: 20 },
      sessions: { orderBy: { createdAt: 'desc' }, take: 5, where: { revokedAt: null } },
      loginLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      adminNotes: { orderBy: { createdAt: 'desc' }, take: 20, include: { author: { select: { id: true, displayName: true, role: true } } } },
      _count: { select: { tasks: true, offers: true, reviewsWritten: true, reviewsReceived: true, reportsFiled: true, reportsAgainst: true } },
    },
  });
  if (!user) throw notFound('User not found');
  // Strip the password hash before returning.
  const { passwordHash, ...safe } = user as any;
  return safe;
}

export async function setUserStatus(targetId: string, status: UserStatus, actorId: string) {
  const updated = await prisma.user.update({ where: { id: targetId }, data: { status } });
  await logAudit(actorId, 'user.status.update', targetId, { status });
  return updated;
}

export async function setUserRole(targetId: string, role: Role, actorId: string) {
  if (role !== 'CUSTOMER' && role !== 'TASKER' && role !== 'ADMIN' && role !== 'SUPPORT') {
    throw badRequest('Invalid role');
  }
  const updated = await prisma.user.update({ where: { id: targetId }, data: { role } });
  await logAudit(actorId, 'user.role.update', targetId, { role });
  return updated;
}

export async function forceKyc(targetId: string, status: KycStatus, reason: string | null, actorId: string) {
  if (!['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'].includes(status)) throw badRequest('Invalid KYC status');
  const data: any = { kycStatus: status };
  if (status === 'APPROVED') { data.kycApprovedAt = new Date(); data.kycRejectedReason = null; }
  if (status === 'REJECTED') { data.kycRejectedReason = reason || 'Rejected by admin'; }
  const updated = await prisma.user.update({ where: { id: targetId }, data });
  if (updated.role === 'TASKER') {
    await prisma.taskerProfile.update({ where: { userId: targetId }, data: { kycStatus: status, kycNotes: reason || undefined } }).catch(() => null);
  }
  await logAudit(actorId, 'user.kyc.override', targetId, { status, reason });
  return updated;
}

export async function banUser(targetId: string, reason: string, actorId: string) {
  // Ban = set status BANNED, revoke sessions, force logout everywhere.
  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { status: UserStatus.BANNED },
  });
  await prisma.session.updateMany({ where: { userId: targetId, revokedAt: null }, data: { revokedAt: new Date() } });
  await logAudit(actorId, 'user.ban', targetId, { reason });
  return updated;
}

export async function unbanUser(targetId: string, actorId: string) {
  const updated = await prisma.user.update({ where: { id: targetId }, data: { status: UserStatus.ACTIVE } });
  await logAudit(actorId, 'user.unban', targetId, {});
  return updated;
}

export async function impersonateUser(targetId: string, actorId: string) {
  // Returns a short-lived access token for the target user. The actor's
  // session is left in place; the audit log captures the impersonation.
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw notFound();
  if (target.status === UserStatus.BANNED) throw forbidden('Cannot impersonate banned user');
  const access = signAccess({ sub: target.id, role: target.role, sid: `imp:${actorId}` });
  await logAudit(actorId, 'user.impersonate', targetId, { email: target.email });
  return { accessToken: access, user: { id: target.id, email: target.email, role: target.role, displayName: target.displayName } };
}

export async function addAdminNote(targetId: string, body: string, actorId: string) {
  const note = await prisma.adminNote.create({
    data: { userId: targetId, authorId: actorId, body },
    include: { author: { select: { id: true, displayName: true, role: true } } },
  });
  await logAudit(actorId, 'user.note.add', targetId, { length: body.length });
  return note;
}

export async function listAdminNotes(targetId: string) {
  return prisma.adminNote.findMany({
    where: { userId: targetId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { author: { select: { id: true, displayName: true, role: true } } },
  });
}

// =====================================================================
// KYC
// =====================================================================

export async function listKycSubmissions(filters: {
  status?: KycSubmissionStatus;
  country?: string;
  mode?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.KycSubmissionWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.mode) where.mode = filters.mode as any;
  if (filters.country) where.user = { country: filters.country.toUpperCase() };
  const [items, total] = await Promise.all([
    prisma.kycSubmission.findMany({
      where, orderBy: { submittedAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: { user: { select: { id: true, email: true, displayName: true, country: true, kycStatus: true, role: true, kycCountry: true } } },
    }),
    prisma.kycSubmission.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function reviewKycSubmission(submissionId: string, action: 'approve' | 'reject', reason: string | null, actorId: string) {
  const sub = await prisma.kycSubmission.findUnique({ where: { id: submissionId }, include: { user: true } });
  if (!sub) throw notFound();
  if (sub.status !== KycSubmissionStatus.PENDING) throw badRequest('Submission already reviewed');
  const updated = await prisma.kycSubmission.update({
    where: { id: submissionId },
    data: {
      status: action === 'approve' ? KycSubmissionStatus.APPROVED : KycSubmissionStatus.REJECTED,
      notes: reason || sub.notes,
      reviewedAt: new Date(),
      reviewedBy: actorId,
    },
  });
  // Roll up the parent user's kycStatus
  const { rollupKycStatus } = await import('./kycService');
  await rollupKycStatus(sub.userId, sub.user.country, sub.user.role as 'CUSTOMER' | 'TASKER');
  await logAudit(actorId, `kyc.${action}`, submissionId, { userId: sub.userId, reason });
  return updated;
}

export async function kycFunnel() {
  const [byStatus, byCountry, byMode] = await Promise.all([
    prisma.user.groupBy({ by: ['kycStatus'], _count: true }),
    prisma.user.groupBy({ by: ['country', 'kycStatus'], _count: true }),
    prisma.kycSubmission.groupBy({ by: ['mode', 'status'], _count: true }),
  ]);
  return { byStatus, byCountry, byMode };
}

// =====================================================================
// Tasks
// =====================================================================

export async function listTasks(filters: { status?: any; q?: string; country?: string; page?: number; pageSize?: number; customerId?: string; taskerId?: string }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.TaskWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.q) where.title = { contains: filters.q, mode: 'insensitive' };
  if (filters.country) where.country = filters.country.toUpperCase();
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.taskerId) where.offers = { some: { taskerId: filters.taskerId } };
  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: {
        customer: { select: { id: true, displayName: true, email: true } },
        offers: { select: { id: true, status: true, price: true, taskerId: true } },
        hires: { select: { id: true, status: true, taskerId: true } },
        _count: { select: { offers: true, reports: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getTaskDetail(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      customer: { select: { id: true, displayName: true, email: true, kycStatus: true } },
      offers: { include: { tasker: { select: { id: true, displayName: true, kycStatus: true } } } },
      hires: true,
      media: true,
      conversation: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 50 } } },
      review: true,
      dispute: true,
      reports: true,
      category: true,
    },
  });
  if (!task) throw notFound();
  return task;
}

export async function forceCancelTask(taskId: string, reason: string, actorId: string) {
  const t = await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.CANCELLED } });
  await logAudit(actorId, 'task.force.cancel', taskId, { reason });
  return t;
}

export async function forceCompleteTask(taskId: string, actorId: string) {
  const t = await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.COMPLETED } });
  await logAudit(actorId, 'task.force.complete', taskId, {});
  return t;
}

// =====================================================================
// Disputes
// =====================================================================

export async function listDisputes(filters: { status?: DisputeStatus; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.DisputeWhereInput = {};
  if (filters.status) where.status = filters.status;
  const [items, total] = await Promise.all([
    prisma.dispute.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: {
        opener: { select: { id: true, displayName: true, email: true } },
        against: { select: { id: true, displayName: true, email: true } },
        task: { select: { id: true, title: true, status: true, budgetAmount: true, currency: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getDispute(disputeId: string) {
  const d = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      opener: { select: { id: true, displayName: true, email: true, kycStatus: true } },
      against: { select: { id: true, displayName: true, email: true, kycStatus: true } },
      task: { include: { offers: { include: { tasker: { select: { id: true, displayName: true } } } }, hires: true, review: true } },
    },
  });
  if (!d) throw notFound();
  return d;
}

export async function resolveDispute(disputeId: string, resolution: 'customer' | 'tasker' | 'split' | 'closed', notes: string, actorId: string) {
  const valid = ['RESOLVED_CUSTOMER', 'RESOLVED_TASKER', 'RESOLVED_SPLIT', 'CLOSED'];
  const map: any = {
    customer: 'RESOLVED_CUSTOMER',
    tasker: 'RESOLVED_TASKER',
    split: 'RESOLVED_SPLIT',
    closed: 'CLOSED',
  };
  const d = await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: map[resolution] as DisputeStatus, resolution: notes },
  });
  await logAudit(actorId, `dispute.resolve.${resolution}`, disputeId, { notes });
  return d;
}

// =====================================================================
// Reports & moderation
// =====================================================================

export async function listReports(filters: { status?: 'OPEN' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED'; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const [items, total] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: {
        reporter: { select: { id: true, displayName: true, email: true } },
        targetUser: { select: { id: true, displayName: true, email: true } },
        task: { select: { id: true, title: true, status: true } },
      },
    }),
    prisma.report.count(),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function listMessageReports(filters: { status?: any; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.MessageReportWhereInput = {};
  if (filters.status) where.status = filters.status;
  const [items, total] = await Promise.all([
    prisma.messageReport.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: {
        reporter: { select: { id: true, displayName: true, email: true } },
        message: { include: { conversation: { select: { id: true } }, sender: { select: { id: true, displayName: true } } } },
      },
    }),
    prisma.messageReport.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function actionReport(reportId: string, action: 'dismiss' | 'warn' | 'ban' | 'remove', actorId: string) {
  const r = await prisma.report.findUnique({ where: { id: reportId } });
  if (!r) throw notFound();
  if (action === 'ban' && r.targetUserId) {
    await prisma.user.update({ where: { id: r.targetUserId }, data: { status: UserStatus.BANNED } });
  }
  await logAudit(actorId, `report.${action}`, reportId, { reporterId: r.reporterId, targetUserId: r.targetUserId });
  return { ok: true, action };
}

export async function actionMessageReport(reportId: string, action: 'dismiss' | 'remove' | 'ban', actorId: string) {
  const r = await prisma.messageReport.findUnique({ where: { id: reportId }, include: { message: true } });
  if (!r) throw notFound();
  const newStatus = action === 'dismiss' ? 'DISMISSED' : 'ACTIONED';
  await prisma.messageReport.update({ where: { id: reportId }, data: { status: newStatus as any } });
  if (action === 'remove' && r.message) {
    await prisma.message.update({ where: { id: r.messageId }, data: { body: '[removed by admin]' } });
  }
  if (action === 'ban' && r.message) {
    await prisma.user.update({ where: { id: r.message.senderId }, data: { status: UserStatus.BANNED } });
  }
  await logAudit(actorId, `messageReport.${action}`, reportId, {});
  return { ok: true, action };
}

export async function listReviewsFlagged(filters: { page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { flagged: true }, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: { author: { select: { id: true, displayName: true } }, target: { select: { id: true, displayName: true } } },
    }),
    prisma.review.count({ where: { flagged: true } }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function moderateReview(reviewId: string, action: 'approve' | 'remove', actorId: string) {
  const r = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!r) throw notFound();
  if (action === 'remove') {
    await prisma.review.delete({ where: { id: reviewId } });
    await logAudit(actorId, 'review.remove', reviewId, {});
    return { ok: true, removed: true };
  }
  await prisma.review.update({ where: { id: reviewId }, data: { flagged: false, moderated: true } });
  await logAudit(actorId, 'review.approve', reviewId, {});
  return { ok: true };
}

// =====================================================================
// Categories
// =====================================================================

export async function listCategoriesForAdmin() {
  return prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { skills: true, tasks: true } } } });
}

export async function createCategory(input: { slug: string; name: string; icon?: string; parentId?: string; active?: boolean }, actorId: string) {
  const c = await prisma.category.create({ data: { ...input, active: input.active ?? true } });
  await logAudit(actorId, 'category.create', c.id, { slug: c.slug });
  return c;
}

export async function updateCategory(id: string, input: { name?: string; icon?: string; parentId?: string | null; active?: boolean }, actorId: string) {
  const c = await prisma.category.update({ where: { id }, data: input });
  await logAudit(actorId, 'category.update', id, input as any);
  return c;
}

export async function deleteCategory(id: string, actorId: string) {
  // Soft-delete by setting active=false. Hard delete would break referential integrity.
  const c = await prisma.category.update({ where: { id }, data: { active: false } });
  await logAudit(actorId, 'category.archive', id, {});
  return c;
}

// =====================================================================
// Broadcasts
// =====================================================================

export async function listBroadcasts(filters: { status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.BroadcastWhereInput = {};
  if (filters.status) where.status = filters.status;
  const [items, total] = await Promise.all([
    prisma.broadcast.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
    }),
    prisma.broadcast.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function createBroadcast(input: { title: string; body: string; audience: string; country?: string; channels: string[] }, actorId: string) {
  const b = await prisma.broadcast.create({
    data: {
      title: input.title,
      body: input.body,
      audience: input.audience,
      country: input.country,
      channels: JSON.stringify(input.channels),
      status: 'DRAFT',
      createdById: actorId,
    },
  });
  await logAudit(actorId, 'broadcast.create', b.id, { audience: input.audience });
  return b;
}

export async function sendBroadcast(id: string, actorId: string) {
  const b = await prisma.broadcast.findUnique({ where: { id } });
  if (!b) throw notFound();
  if (b.status === 'SENT') throw badRequest('Broadcast already sent');

  // Resolve the audience
  const where: Prisma.UserWhereInput = { status: UserStatus.ACTIVE };
  if (b.audience === 'customers') where.role = 'CUSTOMER';
  if (b.audience === 'taskers') where.role = 'TASKER';
  if (b.audience === 'kyc-pending') where.kycStatus = { in: ['PENDING', 'NOT_STARTED'] };
  if (b.audience === 'by-country' && b.country) where.country = b.country;
  const users = await prisma.user.findMany({ where, select: { id: true } });
  const channels: string[] = JSON.parse(b.channels || '["in_app"]');

  // Insert a Notification row per user (in_app) and optionally queue emails.
  const data: any[] = [];
  for (const u of users) {
    for (const ch of channels) {
      data.push({
        userId: u.id,
        channel: ch,
        type: 'BROADCAST',
        title: b.title,
        body: b.body,
        data: JSON.stringify({ broadcastId: b.id }),
      });
    }
  }
  if (data.length) {
    await prisma.notification.createMany({ data });
  }
  // For email channel, fire-and-forget send via SMTP.
  if (channels.includes('email')) {
    const recipients = await prisma.user.findMany({ where, select: { email: true, displayName: true } });
    Promise.allSettled(recipients.map((r) =>
      sendEmail({ to: r.email, subject: b.title, html: `<p>${b.body}</p>`, text: b.body }).catch(() => null)
    )).catch(() => null);
  }
  const updated = await prisma.broadcast.update({
    where: { id },
    data: { status: 'SENT', sentAt: new Date(), recipientCount: users.length },
  });
  await logAudit(actorId, 'broadcast.send', id, { recipientCount: users.length });
  return updated;
}

// =====================================================================
// Analytics
// =====================================================================

export async function analyticsOverview() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    users, customers, taskers,
    tasks, completedTasks, openTasks, inProgressTasks,
    offers, hires, completedHires,
    disputes, openDisputes, resolvedDisputes,
    kycPending, kycApproved, kycRejected,
    logins24h, signups24h, signups7d, signups30d,
    completedTasksGmv,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'TASKER' } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: { in: ['PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'ACCEPTED'] } } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.offer.count(),
    prisma.hire.count(),
    prisma.hire.count({ where: { status: 'COMPLETED' } }),
    prisma.dispute.count(),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } } }),
    prisma.dispute.count({ where: { status: { in: ['RESOLVED_CUSTOMER', 'RESOLVED_TASKER', 'RESOLVED_SPLIT', 'CLOSED'] } } }),
    prisma.user.count({ where: { kycStatus: { in: ['PENDING', 'NOT_STARTED'] } } }),
    prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
    prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
    prisma.loginLog.count({ where: { success: true, createdAt: { gte: since24h } } }),
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({ where: { createdAt: { gte: since30d } } }),
    prisma.task.aggregate({ where: { status: 'COMPLETED' }, _sum: { budgetAmount: true } }),
  ]);
  return {
    users, customers, taskers,
    tasks, completedTasks, openTasks, inProgressTasks,
    offers, hires, completedHires,
    disputes, openDisputes, resolvedDisputes,
    kyc: { pending: kycPending, approved: kycApproved, rejected: kycRejected },
    activity: { logins24h, signups24h, signups7d, signups30d },
    gmv: completedTasksGmv._sum.budgetAmount || 0,
  };
}

export async function signupSeries(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, role: true } });
  // Bucket by day
  const buckets = new Map<string, { day: string; total: number; customers: number; taskers: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: key, total: 0, customers: 0, taskers: 0 });
  }
  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.total++;
      if (u.role === 'CUSTOMER') b.customers++;
      if (u.role === 'TASKER') b.taskers++;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.day.localeCompare(b.day));
}

export async function taskSeries(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const tasks = await prisma.task.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, status: true } });
  const buckets = new Map<string, { day: string; total: number; completed: number; open: number; cancelled: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: key, total: 0, completed: 0, open: 0, cancelled: 0 });
  }
  for (const t of tasks) {
    const b = buckets.get(t.createdAt.toISOString().slice(0, 10));
    if (b) {
      b.total++;
      if (t.status === 'COMPLETED') b.completed++;
      else if (t.status === 'CANCELLED' || t.status === 'EXPIRED') b.cancelled++;
      else b.open++;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.day.localeCompare(b.day));
}

// =====================================================================
// Risk
// =====================================================================

export async function listRiskEvents(filters: { type?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.RiskEventWhereInput = {};
  if (filters.type) where.type = filters.type as any;
  const [items, total] = await Promise.all([
    prisma.riskEvent.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: { user: { select: { id: true, displayName: true, email: true } } },
    }),
    prisma.riskEvent.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function highRiskUsers(limit = 20) {
  return prisma.user.findMany({
    where: { riskScore: { gte: 50 } },
    orderBy: { riskScore: 'desc' },
    take: limit,
    select: { id: true, email: true, displayName: true, role: true, riskScore: true, status: true, country: true, createdAt: true, kycStatus: true },
  });
}

// =====================================================================
// Audit
// =====================================================================

export async function listAuditLogs(filters: { actorId?: string; action?: string; target?: string; page?: number; pageSize?: number; since?: Date }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, filters.pageSize ?? 50));
  const where: Prisma.AuditLogWhereInput = {};
  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.action) where.action = { contains: filters.action };
  if (filters.target) where.target = filters.target;
  if (filters.since) where.createdAt = { gte: filters.since };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, orderBy: { createdAt: 'desc' },
      take: pageSize, skip: (page - 1) * pageSize,
      include: { actor: { select: { id: true, displayName: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

// =====================================================================
// Site settings
// =====================================================================

export async function getSiteSettings() {
  let s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  if (!s) s = await prisma.siteSettings.create({ data: { id: 'singleton' } });
  // Parse JSON fields for the client
  return {
    ...s,
    bannedEmailDomains: JSON.parse(s.bannedEmailDomains || '[]'),
    featureFlags: JSON.parse(s.featureFlags || '{}'),
  };
}

export async function updateSiteSettings(patch: any, actorId: string) {
  const allowed: (keyof Prisma.SiteSettingsUpdateInput)[] = [
    'siteName', 'supportEmail', 'defaultCountry', 'defaultCurrency',
    'maintenanceMode', 'maintenanceMessage', 'kycRequiredFor',
    'bannedEmailDomains', 'featureFlags', 'termsUrl', 'privacyUrl',
  ];
  const data: any = { updatedBy: actorId };
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      if (k === 'bannedEmailDomains' || k === 'featureFlags') {
        data[k] = JSON.stringify(patch[k]);
      } else {
        data[k] = patch[k];
      }
    }
  }
  const s = await prisma.siteSettings.upsert({ where: { id: 'singleton' }, update: data, create: { id: 'singleton', ...data } });
  await logAudit(actorId, 'settings.update', 'singleton', patch);
  return getSiteSettings();
}

// =====================================================================
// Admin management
// =====================================================================

export async function listAdmins() {
  return prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPPORT'] } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function removeAdmin(userId: string, actorId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw notFound('User not found');
  if (u.role !== 'ADMIN' && u.role !== 'SUPPORT') throw badRequest('User is not an admin');
  // Last-admin guard
  if (u.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) throw badRequest('Cannot demote the last ADMIN');
  }
  // Clear any per-user permission overrides
  await prisma.adminPermission.deleteMany({ where: { userId } });
  const updated = await prisma.user.update({ where: { id: userId }, data: { role: 'CUSTOMER' } });
  await logAudit(actorId, 'admin.remove', userId, { previousRole: u.role });
  return updated;
}

export async function createInvite(input: { email?: string; role: 'ADMIN' | 'SUPPORT'; ttlDays?: number }, actorId: string) {
  const ttl = (input.ttlDays || 7) * 24 * 60 * 60 * 1000;
  const invite = await prisma.adminInvite.create({
    data: {
      token: randomToken(24),
      email: input.email,
      role: input.role,
      createdBy: actorId,
      expiresAt: new Date(Date.now() + ttl),
    },
  });
  await logAudit(actorId, 'admin.invite.create', invite.id, { email: input.email, role: input.role });
  return invite;
}

export async function listInvites() {
  return prisma.adminInvite.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
}

export async function revokeInvite(inviteId: string, actorId: string) {
  await prisma.adminInvite.update({ where: { id: inviteId }, data: { expiresAt: new Date(Date.now() - 1000) } });
  await logAudit(actorId, 'admin.invite.revoke', inviteId, {});
  return { ok: true };
}

/** Consume an invite — used by /api/admin/invites/accept. The user must
 *  already exist; we just promote their role. */
export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.adminInvite.findUnique({ where: { token } });
  if (!invite) throw notFound('Invite not found');
  if (invite.consumedAt) throw badRequest('Invite already used');
  if (invite.expiresAt < new Date()) throw badRequest('Invite expired');
  const updated = await prisma.user.update({ where: { id: userId }, data: { role: invite.role } });
  await prisma.adminInvite.update({ where: { id: invite.id }, data: { consumedAt: new Date(), consumedBy: userId } });
  await logAudit(userId, 'admin.invite.accept', invite.id, { role: invite.role });
  return updated;
}

// =====================================================================
// Admin permissions (per-user overrides)
// =====================================================================

export async function getAdminPermissions(userId: string) {
  return prisma.adminPermission.findUnique({ where: { userId } });
}

export async function setAdminPermissions(userId: string, allow: string[], deny: string[], actorId: string) {
  const updated = await prisma.adminPermission.upsert({
    where: { userId },
    create: { userId, allow: JSON.stringify(allow), deny: JSON.stringify(deny), updatedBy: actorId },
    update: { allow: JSON.stringify(allow), deny: JSON.stringify(deny), updatedBy: actorId },
  });
  await logAudit(actorId, 'admin.permissions.update', userId, { allow, deny });
  return updated;
}

export async function loadActorContext(actorId: string) {
  const u = await prisma.user.findUnique({ where: { id: actorId } });
  if (!u) return null;
  const perm = await prisma.adminPermission.findUnique({ where: { userId: actorId } });
  return {
    user: u,
    permissions: perm ? { allow: JSON.parse(perm.allow), deny: JSON.parse(perm.deny) } : null,
    capabilities: Array.from(effectiveCapabilities(u.role, perm ? { allow: JSON.parse(perm.allow), deny: JSON.parse(perm.deny) } : null)),
  };
}

// =====================================================================
// First-time admin bootstrap (used by the CLI)
// =====================================================================

export async function ensureInitialAdmin(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
    }
    return existing;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      country: 'US',
      currency: 'USD',
      locale: 'en',
      displayName: 'Admin',
      signupStep: 'COMPLETE',
      kycStatus: 'APPROVED',
    },
  });
  return user;
}
