import { PrismaClient, TaskStatus, MediaKind } from '@prisma/client';
import { badRequest, notFound, forbidden } from '../errors';
import { assertTransition } from '../domain/taskStateMachine';
import { SUPPORTED_CURRENCIES } from '../config';

const prisma = new PrismaClient();

export interface CreateTaskInput {
  title: string;
  description: string;
  categoryId?: string;
  mode: 'LOCAL' | 'REMOTE';
  budgetType: 'FIXED' | 'HOURLY';
  budgetAmount: number;
  currency: string;
  preferredAt?: string;
  expiresAt?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  serviceRadiusKm?: number;
}

export async function createTask(userId: string, input: CreateTaskInput, media: { url: string; kind: MediaKind }[] = []) {
  if (input.budgetAmount <= 0) throw badRequest('budgetAmount must be > 0');
  if (!SUPPORTED_CURRENCIES.includes(input.currency)) throw badRequest('Unsupported currency');
  const task = await prisma.task.create({
    data: {
      customerId: userId,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      mode: input.mode,
      budgetType: input.budgetType,
      budgetAmount: input.budgetAmount,
      currency: input.currency,
      preferredAt: input.preferredAt ? new Date(input.preferredAt) : null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      city: input.city,
      country: input.country || 'NG',
      lat: input.lat,
      lng: input.lng,
      serviceRadiusKm: input.serviceRadiusKm ?? 10,
      status: TaskStatus.DRAFT,
      media: { create: media.map((m) => ({ url: m.url, kind: m.kind })) },
    },
    include: { media: true },
  });
  return task;
}

export async function updateTask(userId: string, id: string, data: Partial<CreateTaskInput>) {
  const t = await prisma.task.findUnique({ where: { id } });
  if (!t) throw notFound();
  if (t.customerId !== userId) throw forbidden();
  if (![TaskStatus.DRAFT, TaskStatus.PUBLISHED].includes(t.status as any)) throw badRequest('Task cannot be edited at this stage');
  return prisma.task.update({ where: { id }, data: {
    title: data.title, description: data.description, categoryId: data.categoryId,
    mode: data.mode, budgetType: data.budgetType, budgetAmount: data.budgetAmount, currency: data.currency,
    preferredAt: data.preferredAt ? new Date(data.preferredAt) : undefined,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    city: data.city, country: data.country, lat: data.lat, lng: data.lng, serviceRadiusKm: data.serviceRadiusKm,
  } });
}

export async function publishTask(userId: string, id: string) {
  const t = await prisma.task.findUnique({ where: { id } });
  if (!t) throw notFound();
  if (t.customerId !== userId) throw forbidden();
  if (!t.title || !t.description) throw badRequest('Title and description required');
  assertTransition(t.status, TaskStatus.PUBLISHED);
  return prisma.task.update({ where: { id }, data: { status: TaskStatus.PUBLISHED } });
}

export async function cancelTask(userId: string, id: string) {
  const t = await prisma.task.findUnique({ where: { id } });
  if (!t) throw notFound();
  if (t.customerId !== userId) throw forbidden();
  if (![TaskStatus.DRAFT, TaskStatus.PUBLISHED, TaskStatus.RECEIVING_OFFERS, TaskStatus.OFFER_SELECTED, TaskStatus.ACCEPTED].includes(t.status as any)) {
    throw badRequest('Task cannot be cancelled at this stage');
  }
  return prisma.task.update({ where: { id }, data: { status: TaskStatus.CANCELLED } });
}

export async function getTask(id: string, viewerId?: string) {
  const t = await prisma.task.findUnique({
    where: { id },
    include: {
      media: true,
      customer: { select: { id: true, displayName: true, avatarUrl: true, country: true, customerProfile: true } },
      offers: { include: { tasker: { select: { id: true, displayName: true, avatarUrl: true, taskerProfile: true } } }, orderBy: { createdAt: 'desc' } },
      hires: true,
    },
  });
  if (!t) throw notFound();
  // hide offers unless viewer is the customer or admin
  if (viewerId !== t.customerId) {
    return { ...t, offers: undefined };
  }
  return t;
}

export interface ListTasksQuery {
  q?: string;
  categoryId?: string;
  mode?: 'LOCAL' | 'REMOTE';
  country?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  currency?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
  sort?: 'recent' | 'budget_high' | 'budget_low' | 'relevance';
}

export async function listTasks(q: ListTasksQuery) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, q.pageSize ?? 20));
  const where: any = { status: { in: [TaskStatus.PUBLISHED, TaskStatus.RECEIVING_OFFERS] } };
  if (q.categoryId) where.categoryId = q.categoryId;
  if (q.mode) where.mode = q.mode;
  if (q.country) where.country = q.country;
  if (q.city) where.city = { contains: q.city, mode: 'insensitive' };
  if (q.currency) where.currency = q.currency;
  if (q.minBudget !== undefined || q.maxBudget !== undefined) {
    where.budgetAmount = {};
    if (q.minBudget !== undefined) where.budgetAmount.gte = q.minBudget;
    if (q.maxBudget !== undefined) where.budgetAmount.lte = q.maxBudget;
  }
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: 'insensitive' } },
      { description: { contains: q.q, mode: 'insensitive' } },
    ];
  }
  if (q.lat !== undefined && q.lng !== undefined && q.radiusKm) {
    // crude bounding box (1 deg lat ~ 111 km)
    const latDelta = q.radiusKm / 111;
    const lngDelta = q.radiusKm / (111 * Math.max(0.1, Math.cos((q.lat * Math.PI) / 180)));
    where.lat = { gte: q.lat - latDelta, lte: q.lat + latDelta };
    where.lng = { gte: q.lng - lngDelta, lte: q.lng + lngDelta };
  }
  const orderBy: any = q.sort === 'budget_high' ? { budgetAmount: 'desc' } : q.sort === 'budget_low' ? { budgetAmount: 'asc' } : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.task.findMany({ where, orderBy, take: pageSize, skip: (page - 1) * pageSize, include: { media: true, customer: { select: { id: true, displayName: true, avatarUrl: true } } } }),
    prisma.task.count({ where }),
  ]);
  return { items, page, pageSize, total, pages: Math.ceil(total / pageSize) };
}

export async function listMyTasks(userId: string, status?: TaskStatus) {
  return prisma.task.findMany({ where: { customerId: userId, ...(status ? { status } : {}) }, orderBy: { createdAt: 'desc' } });
}

export async function addMedia(userId: string, taskId: string, media: { url: string; kind: MediaKind }[]) {
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) throw notFound();
  if (t.customerId !== userId) throw forbidden();
  if (![TaskStatus.DRAFT, TaskStatus.PUBLISHED].includes(t.status as any)) throw badRequest('Cannot add media at this stage');
  await prisma.taskMedia.createMany({ data: media.map((m) => ({ taskId, url: m.url, kind: m.kind })) });
  return prisma.taskMedia.findMany({ where: { taskId } });
}