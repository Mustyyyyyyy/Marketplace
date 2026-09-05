import { PrismaClient, UserStatus, Role } from '@prisma/client';
import { notFound, badRequest, forbidden } from '../errors';

const prisma = new PrismaClient();

export async function listUsers(filters: { q?: string; role?: Role; status?: UserStatus; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: any = {};
  if (filters.q) where.email = { contains: filters.q, mode: 'insensitive' };
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: pageSize, skip: (page - 1) * pageSize, select: { id: true, email: true, displayName: true, role: true, status: true, country: true, createdAt: true, riskScore: true, emailVerified: true, phoneVerified: true } }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function setUserStatus(targetId: string, status: UserStatus) {
  return prisma.user.update({ where: { id: targetId }, data: { status } });
}

export async function listTasks(filters: { status?: any; page?: number; pageSize?: number; q?: string }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.q) where.title = { contains: filters.q, mode: 'insensitive' };
  const [items, total] = await Promise.all([
    prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, take: pageSize, skip: (page - 1) * pageSize, include: { customer: { select: { id: true, displayName: true, email: true } } } }),
    prisma.task.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function listReports() {
  return prisma.report.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { reporter: { select: { id: true, displayName: true, email: true } }, targetUser: { select: { id: true, displayName: true, email: true } } } });
}

export async function listMessageReports() {
  return prisma.messageReport.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { message: true, reporter: { select: { id: true, displayName: true, email: true } } } });
}

export async function listReviewsFlagged() {
  return prisma.review.findMany({ where: { flagged: true }, orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, displayName: true } }, target: { select: { id: true, displayName: true } } } });
}

export async function moderateReview(reviewId: string, action: 'approve' | 'remove') {
  const r = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!r) throw notFound();
  if (action === 'remove') {
    await prisma.review.delete({ where: { id: reviewId } });
    return { ok: true, removed: true };
  }
  await prisma.review.update({ where: { id: reviewId }, data: { flagged: false, moderated: true } });
  return { ok: true };
}

export async function listRiskEvents() {
  return prisma.riskEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { id: true, displayName: true, email: true } } } });
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { actor: { select: { id: true, displayName: true, role: true } } } });
}

export async function analytics() {
  const [users, customers, taskers, tasks, completed, offers, disputes, openDisputes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'TASKER' } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.offer.count(),
    prisma.dispute.count(),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
  ]);
  return { users, customers, taskers, tasks, completed, offers, disputes, openDisputes };
}

export async function logAudit(actorId: string | null, action: string, target?: string, metadata?: any, ip?: string) {
  await prisma.auditLog.create({ data: { actorId: actorId || undefined, action, target, metadata: metadata ? JSON.stringify(metadata) : undefined, ip } });
}