import { PrismaClient } from '@prisma/client';
import { notFound, badRequest, forbidden } from '../errors';
import { withRetry } from '../db';

const prisma = new PrismaClient();

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
      taskerProfile: { include: { skills: { include: { skill: true } }, certifications: true, portfolioItems: true, availability: true } },
      preferences: true,
    },
  });
  if (!user) throw notFound('User not found');
  return user;
}

export async function updateMyProfile(userId: string, data: { displayName?: string; avatarUrl?: string; bio?: string; country?: string; locale?: string; currency?: string; timezone?: string; }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      country: data.country,
      locale: data.locale,
      currency: data.currency,
      timezone: data.timezone,
      ...(data.bio !== undefined ? { customerProfile: { update: { bio: data.bio } } } : {}),
    },
  });
  return user;
}

export async function setMyAvatar(userId: string, avatarUrl: string, avatarPublicId?: string) {
  return withRetry(() => prisma.user.update({ where: { id: userId }, data: { avatarUrl, avatarPublicId } }));
}

export async function updateTaskerProfile(userId: string, data: { bio?: string; headline?: string; experienceYears?: number; travelRadiusKm?: number; remoteOk?: boolean; }) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Tasker profile not found');
  return prisma.taskerProfile.update({ where: { userId }, data });
}

export async function setTaskerSkills(userId: string, skillNames: string[]) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Tasker profile not found');
  const normalized = Array.from(new Set(skillNames.map((s) => s.trim().toLowerCase()).filter(Boolean)));
  if (!normalized.length) throw badRequest('No skills provided');
  const skills = await Promise.all(normalized.map((name) => prisma.skill.upsert({ where: { name }, update: {}, create: { name } })));
  await prisma.taskerSkill.deleteMany({ where: { taskerProfileId: tp.id } });
  await prisma.taskerSkill.createMany({ data: skills.map((s) => ({ taskerProfileId: tp.id, skillId: s.id })) });
  return { count: skills.length };
}

export async function addCertification(userId: string, data: { title: string; issuer?: string; issuedAt?: string; expiresAt?: string; documentUrl?: string; }) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Tasker profile not found');
  return prisma.certification.create({
    data: {
      taskerProfileId: tp.id,
      title: data.title,
      issuer: data.issuer,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      documentUrl: data.documentUrl,
    },
  });
}

export async function removeCertification(userId: string, id: string) {
  const cert = await prisma.certification.findUnique({ where: { id }, include: { tasker: true } });
  if (!cert || cert.tasker.userId !== userId) throw forbidden();
  await prisma.certification.delete({ where: { id } });
  return { ok: true };
}

export async function addPortfolioItem(userId: string, data: { title: string; description?: string; mediaUrl?: string; }) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Tasker profile not found');
  return prisma.portfolioItem.create({ data: { taskerProfileId: tp.id, ...data } });
}

export async function removePortfolioItem(userId: string, id: string) {
  const item = await prisma.portfolioItem.findUnique({ where: { id }, include: { tasker: true } });
  if (!item || item.tasker.userId !== userId) throw forbidden();
  await prisma.portfolioItem.delete({ where: { id } });
  return { ok: true };
}

export async function setAvailability(userId: string, windows: { weekday: number; startMinute: number; endMinute: number }[]) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId } });
  if (!tp) throw notFound('Tasker profile not found');
  await prisma.availabilityWindow.deleteMany({ where: { taskerProfileId: tp.id } });
  if (windows.length) {
    await prisma.availabilityWindow.createMany({ data: windows.map((w) => ({ ...w, taskerProfileId: tp.id })) });
  }
  return { count: windows.length };
}

export async function getPublicTasker(id: string) {
  const u = await prisma.user.findUnique({
    where: { id },
    include: {
      taskerProfile: { include: { skills: { include: { skill: true } }, certifications: true, portfolioItems: true, availability: true } },
    },
  });
  if (!u || !u.taskerProfile) throw notFound();
  const reviews = await prisma.review.findMany({ where: { targetId: id }, orderBy: { createdAt: 'desc' }, take: 20 });
  return { user: publicUser(u), taskerProfile: u.taskerProfile, reviews };
}

export function publicUser(u: any) {
  return {
    id: u.id,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    country: u.country,
    locale: u.locale,
    createdAt: u.createdAt,
  };
}