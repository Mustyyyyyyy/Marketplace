import { PrismaClient, ConversationKind, MessageReportStatus, ReportTargetType } from '@prisma/client';
import { badRequest, notFound, forbidden, HttpError } from '../errors';

const prisma = new PrismaClient();

async function assertNotBlocked(a: string, b: string) {
  const block = await prisma.block.findFirst({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] } });
  if (block) throw forbidden('Conversation blocked');
}

export async function getOrCreateTaskConversation(userId: string, taskId: string, selectedTaskerId?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { conversation: true } });
  if (!task) throw notFound('Task not found');
  if (task.customerId !== userId) {
    // Only a tasker who has made an offer can start a conversation
    const offer = await prisma.offer.findFirst({ where: { taskId, taskerId: userId } });
    if (!offer) throw forbidden('Only the task owner or an offerer can open a conversation');
  }
  if (task.conversation) return task.conversation;
  const other = task.customerId === userId
    ? (await prisma.offer.findFirst({ where: { taskId, ...(selectedTaskerId ? { taskerId: selectedTaskerId } : {}) }, orderBy: { createdAt: 'asc' } }))?.taskerId
    : task.customerId;
  if (!other) throw badRequest('No other party to chat with yet');
  return prisma.conversation.create({ data: { taskId, userAId: task.customerId, userBId: other, kind: ConversationKind.TASK } });
}

export async function getOrCreateDirectConversation(userId: string, otherId: string) {
  if (otherId === userId) throw badRequest('Cannot start a conversation with yourself');
  await assertNotBlocked(userId, otherId);
  const a = [userId, otherId].sort();
  const existing = await prisma.conversation.findFirst({ where: { userAId: a[0], userBId: a[1], kind: ConversationKind.DIRECT } });
  if (existing) return existing;
  return prisma.conversation.create({ data: { userAId: a[0], userBId: a[1], kind: ConversationKind.DIRECT } });
}

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } }, task: { select: { id: true, title: true, status: true } } },
  });
}

export async function getMessages(userId: string, conversationId: string, before?: string) {
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw notFound();
  if (conv.userAId !== userId && conv.userBId !== userId) throw forbidden();
  const where: any = { conversationId };
  if (before) where.createdAt = { lt: new Date(before) };
  const messages = await prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  return messages.reverse();
}

export async function sendMessage(userId: string, conversationId: string, body: string, attachmentUrl?: string) {
  const text = (body || '').trim();
  if (!text && !attachmentUrl) throw badRequest('Empty message');
  if (text.length > 4000) throw badRequest('Message too long');
  const normalized = text.toLowerCase().replace(/[\s().-]+/g, '');
  const hasContactDetails = /(?:https?:\/\/|www\.)\S+|[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{7,}\d|(?:whatsapp|telegram|signal|instagram|snapchat|facebook|tiktok)\s*[:@]?\s*[\w.+-]+|(?:email|e-mail|phone|call|text|message)\s+me/.test(text)
    || /(?:whatsapp|telegram|signal|instagram|snapchat|facebook|tiktok)/.test(normalized);
  if (hasContactDetails || (attachmentUrl && /(?:whatsapp|telegram|instagram|facebook|tiktok|mailto:|tel:)/i.test(attachmentUrl))) {
    throw badRequest('For your safety, contact details and external links cannot be shared in chat.');
  }
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw notFound();
  if (conv.userAId !== userId && conv.userBId !== userId) throw forbidden();
  await assertNotBlocked(conv.userAId, conv.userBId);
  return prisma.message.create({ data: { conversationId, senderId: userId, body: text, attachmentUrl } });
}

export async function markRead(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw notFound();
  if (conv.userAId !== userId && conv.userBId !== userId) throw forbidden();
  await prisma.message.updateMany({ where: { conversationId, readAt: null, NOT: { senderId: userId } }, data: { readAt: new Date() } });
  return { ok: true };
}

export async function reportMessage(userId: string, messageId: string, reason: string, details?: string) {
  const m = await prisma.message.findUnique({ where: { id: messageId }, include: { conversation: true } });
  if (!m) throw notFound();
  if (m.conversation.userAId !== userId && m.conversation.userBId !== userId) throw forbidden();
  return prisma.messageReport.create({ data: { messageId, reporterId: userId, reason, details, status: MessageReportStatus.OPEN } });
}

export async function blockUser(userId: string, blockedId: string) {
  if (userId === blockedId) throw badRequest('Cannot block yourself');
  await prisma.block.upsert({ where: { blockerId_blockedId: { blockerId: userId, blockedId } }, update: {}, create: { blockerId: userId, blockedId } });
  return { ok: true };
}

export async function unblockUser(userId: string, blockedId: string) {
  await prisma.block.deleteMany({ where: { blockerId: userId, blockedId } });
  return { ok: true };
}

export async function listBlocks(userId: string) {
  return prisma.block.findMany({ where: { blockerId: userId }, include: { blocked: { select: { id: true, displayName: true, avatarUrl: true } } } });
}