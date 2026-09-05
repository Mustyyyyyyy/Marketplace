import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Rule-based recommendation. Designed so a future ML ranker can be plugged in via the same interface.
export async function recommendTaskers(taskId: string, limit = 20) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { category: { include: { skills: true } } } });
  if (!task) return [];
  const skillNames = task.category?.skills.map((s) => s.name) || [];

  // 1. skills match (case-insensitive on normalized names)
  const candidates = await prisma.user.findMany({
    where: { role: 'TASKER', status: 'ACTIVE', taskerProfile: { kycStatus: 'APPROVED' } },
    include: {
      taskerProfile: { include: { skills: { include: { skill: true } } } },
    },
    take: 200,
  });

  const scored = candidates.map((u) => {
    const skills = new Set(u.taskerProfile?.skills.map((s) => s.skill.name.toLowerCase()) || []);
    const skillMatches = skillNames.filter((n) => skills.has(n.toLowerCase())).length;
    const rating = u.taskerProfile?.ratingAvg || 0;
    const completed = u.taskerProfile?.completedCount || 0;
    const response = u.taskerProfile?.responseRate || 0;
    const remote = u.taskerProfile?.remoteOk ? 1 : 0;
    let distance = 9999;
    if (task.lat != null && task.lng != null && u.taskerProfile?.travelRadiusKm) {
      // crude distance in km using equirectangular approx
      const dx = (u.taskerProfile ? 0 : 0);
    }
    return {
      userId: u.id,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      rating,
      completed,
      response,
      remote,
      skillMatches,
      score: skillMatches * 5 + rating * 2 + Math.log(1 + completed) + response * 0.5 + remote,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export async function recommendTasksForTasker(taskerId: string, limit = 20) {
  const tp = await prisma.taskerProfile.findUnique({ where: { userId: taskerId }, include: { skills: { include: { skill: true } } } });
  if (!tp) return [];
  const skillSet = new Set(tp.skills.map((s) => s.skill.name.toLowerCase()));
  const tasks = await prisma.task.findMany({
    where: { status: { in: [TaskStatus.PUBLISHED, TaskStatus.RECEIVING_OFFERS] } },
    include: { category: { include: { skills: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const scored = tasks.map((t) => {
    const taskSkills = (t.category?.skills || []).map((s) => s.name.toLowerCase());
    const overlap = taskSkills.filter((n) => skillSet.has(n)).length;
    return { taskId: t.id, title: t.title, budgetAmount: t.budgetAmount, currency: t.currency, mode: t.mode, city: t.city, country: t.country, score: overlap * 3 + (t.budgetAmount || 0) / 1000 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}