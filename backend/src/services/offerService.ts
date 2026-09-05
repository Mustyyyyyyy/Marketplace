import { PrismaClient, OfferStatus, TaskStatus, HireStatus } from '@prisma/client';
import { badRequest, notFound, forbidden, conflict, HttpError } from '../errors';
import { assertTransition } from '../domain/taskStateMachine';
import { SUPPORTED_CURRENCIES } from '../config';

const prisma = new PrismaClient();

export async function submitOffer(taskerId: string, taskId: string, data: { price: number; currency: string; timelineDays: number; proposal: string; experience?: string }) {
  if (data.price <= 0) throw badRequest('price must be > 0');
  if (!SUPPORTED_CURRENCIES.includes(data.currency)) throw badRequest('Unsupported currency');
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound();
  if (task.customerId === taskerId) throw badRequest('Cannot offer on your own task');
  if (![TaskStatus.PUBLISHED, TaskStatus.RECEIVING_OFFERS].includes(task.status as any)) throw badRequest('Task not accepting offers');

  // Block if blocked
  const blocked = await prisma.block.findFirst({ where: { OR: [{ blockerId: task.customerId, blockedId: taskerId }, { blockerId: taskerId, blockedId: task.customerId }] } });
  if (blocked) throw forbidden('Cannot interact with this user');

  // Auto move task to RECEIVING_OFFERS
  if (task.status === TaskStatus.PUBLISHED) {
    await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.RECEIVING_OFFERS } });
  }

  const existing = await prisma.offer.findFirst({ where: { taskId, taskerId, status: { in: [OfferStatus.PENDING, OfferStatus.ACCEPTED] } } });
  if (existing) throw conflict('You already have an active offer on this task');

  return prisma.offer.create({
    data: { taskId, taskerId, price: data.price, currency: data.currency, timelineDays: data.timelineDays, proposal: data.proposal, experience: data.experience },
  });
}

export async function withdrawOffer(taskerId: string, offerId: string) {
  const o = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!o) throw notFound();
  if (o.taskerId !== taskerId) throw forbidden();
  if (o.status !== OfferStatus.PENDING) throw badRequest('Only pending offers can be withdrawn');
  return prisma.offer.update({ where: { id: offerId }, data: { status: OfferStatus.WITHDRAWN } });
}

export async function rejectOffer(customerId: string, offerId: string) {
  const o = await prisma.offer.findUnique({ where: { id: offerId }, include: { task: true } });
  if (!o) throw notFound();
  if (o.task.customerId !== customerId) throw forbidden();
  if (o.status !== OfferStatus.PENDING) throw badRequest('Only pending offers can be rejected');
  return prisma.offer.update({ where: { id: offerId }, data: { status: OfferStatus.REJECTED } });
}

export async function acceptOffer(customerId: string, offerId: string) {
  const o = await prisma.offer.findUnique({ where: { id: offerId }, include: { task: true } });
  if (!o) throw notFound();
  if (o.task.customerId !== customerId) throw forbidden();
  if (o.status !== OfferStatus.PENDING) throw badRequest('Only pending offers can be accepted');
  if (![TaskStatus.PUBLISHED, TaskStatus.RECEIVING_OFFERS].includes(o.task.status as any)) throw badRequest('Task not in a state to accept offers');

  // Reject all other pending offers, then mark selected
  const result = await prisma.$transaction(async (tx) => {
    await tx.offer.updateMany({ where: { taskId: o.taskId, status: OfferStatus.PENDING, NOT: { id: o.id } }, data: { status: OfferStatus.REJECTED } });
    await tx.offer.update({ where: { id: o.id }, data: { status: OfferStatus.ACCEPTED } });
    const task = await tx.task.update({ where: { id: o.taskId }, data: { status: TaskStatus.OFFER_SELECTED } });
    const hire = await tx.hire.create({ data: { taskId: o.taskId, taskerId: o.taskerId, customerId, offerId: o.id, status: HireStatus.ACTIVE } });
    return { offer: o, task, hire };
  });
  return result;
}

export async function startWork(taskerId: string, taskId: string) {
  const hire = await prisma.hire.findFirst({ where: { taskId, taskerId } });
  if (!hire) throw forbidden('Not hired for this task');
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) throw notFound();
  assertTransition(t.status, TaskStatus.IN_PROGRESS);
  await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.IN_PROGRESS } });
  await prisma.hire.update({ where: { id: hire.id }, data: { startedAt: new Date() } });
  return { ok: true };
}

export async function submitCompletion(taskerId: string, taskId: string, evidence: string) {
  const hire = await prisma.hire.findFirst({ where: { taskId, taskerId } });
  if (!hire) throw forbidden();
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) throw notFound();
  if (t.status !== TaskStatus.IN_PROGRESS) throw badRequest('Task not in progress');
  await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.SUBMITTED, completionEvidence: evidence } });
  await prisma.hire.update({ where: { id: hire.id }, data: { submittedAt: new Date() } });
  return { ok: true };
}

export async function confirmCompletion(customerId: string, taskId: string) {
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) throw notFound();
  if (t.customerId !== customerId) throw forbidden();
  if (![TaskStatus.SUBMITTED, TaskStatus.CUSTOMER_REVIEW].includes(t.status as any)) throw badRequest('Task not awaiting review');
  await prisma.task.update({ where: { id: taskId }, data: { status: TaskStatus.CUSTOMER_REVIEW } });
  return { ok: true };
}

export async function listOffersForTask(customerId: string, taskId: string) {
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) throw notFound();
  if (t.customerId !== customerId) throw forbidden();
  return prisma.offer.findMany({ where: { taskId }, include: { tasker: { select: { id: true, displayName: true, avatarUrl: true, taskerProfile: true } } }, orderBy: { createdAt: 'desc' } });
}

export async function myOffers(taskerId: string) {
  return prisma.offer.findMany({ where: { taskerId }, include: { task: { select: { id: true, title: true, status: true, budgetAmount: true, currency: true } } }, orderBy: { createdAt: 'desc' } });
}