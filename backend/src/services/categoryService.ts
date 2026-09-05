import { PrismaClient } from '@prisma/client';
import { badRequest, notFound } from '../errors';

const prisma = new PrismaClient();

export async function listCategories() {
  return prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' }, include: { children: true } });
}

export async function createCategory(data: { name: string; slug: string; icon?: string; parentId?: string }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: { name?: string; icon?: string; active?: boolean; parentId?: string | null }) {
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c) throw notFound();
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c) throw notFound();
  // soft delete
  await prisma.category.update({ where: { id }, data: { active: false } });
  return { ok: true };
}

export async function getCategoryOrThrow(id: string) {
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c || !c.active) throw notFound('Category not found');
  return c;
}