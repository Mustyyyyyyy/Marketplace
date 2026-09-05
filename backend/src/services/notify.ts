import { PrismaClient, NotificationChannel, RiskEventType } from '@prisma/client';
import { sendEmail, sendSms } from './notifier';

const prisma = new PrismaClient();

export type NotificationType =
  | 'REGISTRATION'
  | 'VERIFICATION'
  | 'NEW_TASK'
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'TASK_STATUS'
  | 'COMPLETION_SUBMITTED'
  | 'REVIEW_RECEIVED'
  | 'DISPUTE_OPENED'
  | 'SECURITY'
  | 'GENERIC';

export async function notify(opts: { userId: string; type: NotificationType; title: string; body: string; data?: any; channels?: NotificationChannel[]; }) {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId_type: { userId: opts.userId, type: opts.type } } });
  const defaults = { inApp: true, email: true, push: true, sms: false };
  const p = { ...defaults, ...(prefs || {}) };
  const channels = opts.channels || (Object.keys(p) as unknown as NotificationChannel[]);
  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) return;

  if (channels.includes(NotificationChannel.IN_APP) && p.inApp) {
    await prisma.notification.create({ data: { userId: opts.userId, channel: NotificationChannel.IN_APP, type: opts.type, title: opts.title, body: opts.body, data: opts.data ? JSON.stringify(opts.data) : null } });
  }
  if (channels.includes(NotificationChannel.EMAIL) && p.email && user.email) {
    await sendEmail({ to: user.email, subject: opts.title, html: `<p>${escape(opts.body)}</p>`, text: opts.body });
  }
  if (channels.includes(NotificationChannel.SMS) && p.sms && user.phone) {
    await sendSms(user.phone, `${opts.title}: ${opts.body}`);
  }
  if (channels.includes(NotificationChannel.PUSH) && p.push) {
    // Plug in FCM/APNS later
  }
}

export async function logRisk(userId: string | null, type: RiskEventType, score: number, details?: string) {
  await prisma.riskEvent.create({ data: { userId: userId || undefined, type, score, details } });
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newScore = (user.riskScore || 0) + score;
      await prisma.user.update({ where: { id: userId }, data: { riskScore: Math.min(100, newScore) } });
    }
  }
}

function escape(s: string) { return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }