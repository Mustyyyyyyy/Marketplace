import { PrismaClient, DisputeStatus, ReportTargetType, KycStatus, UserStatus } from '@prisma/client';
import { badRequest, notFound, forbidden } from '../errors';
import { sendEmail, kycDecisionEmail } from './emailService';

const prisma = new PrismaClient();

export async function fileReport(reporterId: string, data: { targetType: ReportTargetType; targetId: string; reason: string; details?: string; targetUserId?: string; taskId?: string }) {
  return prisma.report.create({
    data: {
      reporterId, targetType: data.targetType, targetId: data.targetId, reason: data.reason, details: data.details, targetUserId: data.targetUserId, taskId: data.taskId,
    },
  });
}

export async function openDispute(openerId: string, taskId: string, reason: string, details: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { hires: true } });
  if (!task) throw notFound();
  const hire = task.hires[0];
  if (!hire) throw badRequest('No hire on this task');
  if (openerId !== task.customerId && openerId !== hire.taskerId) throw forbidden('Only participants can open a dispute');

  const existing = await prisma.dispute.findUnique({ where: { taskId } });
  if (existing) throw badRequest('A dispute already exists for this task');

  const againstId = openerId === task.customerId ? hire.taskerId : task.customerId;
  const dispute = await prisma.dispute.create({
    data: { taskId, openerId, againstId, reason, details, status: DisputeStatus.OPEN },
  });
  await prisma.task.update({ where: { id: taskId }, data: { status: 'DISPUTED' } });
  return dispute;
}

export async function listDisputes() {
  return prisma.dispute.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { task: { select: { id: true, title: true } }, opener: { select: { id: true, displayName: true } }, against: { select: { id: true, displayName: true } } } });
}

export async function getDispute(id: string) {
  return prisma.dispute.findUnique({ where: { id }, include: { task: true, opener: { select: { id: true, displayName: true } }, against: { select: { id: true, displayName: true } } } });
}

export async function updateDisputeStatus(id: string, status: DisputeStatus, resolution?: string) {
  const d = await prisma.dispute.findUnique({ where: { id } });
  if (!d) throw notFound();
  return prisma.dispute.update({ where: { id }, data: { status, resolution, updatedAt: new Date() } });
}

export async function submitKyc(userId: string, data: { documentUrl: string; notes?: string }) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Only taskers can submit KYC');
  return prisma.taskerProfile.update({ where: { userId }, data: { kycStatus: KycStatus.PENDING, kycNotes: data.notes } });
}

export async function reviewKyc(targetUserId: string, approve: boolean, notes?: string) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId: targetUserId } });
  if (!tp) throw notFound();
  const updated = await prisma.taskerProfile.update({ where: { userId: targetUserId }, data: { kycStatus: approve ? KycStatus.APPROVED : KycStatus.REJECTED, kycNotes: notes } });
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (user) {
    try {
      const tpl = kycDecisionEmail({ name: user.displayName || undefined, approved: approve, notes });
      await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    } catch (e) { console.error('kyc decision email failed', e); }
  }
  return updated;
}

export async function suspendUser(targetUserId: string, suspend: boolean) {
  return prisma.user.update({ where: { id: targetUserId }, data: { status: suspend ? UserStatus.SUSPENDED : UserStatus.ACTIVE } });
}