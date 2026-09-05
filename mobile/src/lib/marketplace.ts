import { API_BASE, api } from './api';

export interface PublicStats { tasksTotal: number; completedTasks: number; taskersTotal: number; categoriesTotal: number; openTasks: number; ratingAvg: number; reviewCount: number; }

const EMPTY_STATS: PublicStats = { tasksTotal: 0, completedTasks: 0, taskersTotal: 0, categoriesTotal: 0, openTasks: 0, ratingAvg: 0, reviewCount: 0 };

export async function fetchPublicStats(): Promise<PublicStats> {
  try { return await api.get<PublicStats>('/api/public/stats', undefined, { auth: false } as any) || EMPTY_STATS; }
  catch { return EMPTY_STATS; }
}

export async function fetchCategories() {
  try { const r: any = await api.get('/api/categories', undefined, { auth: false } as any); return r.categories || []; } catch { return []; }
}

export async function fetchFirebaseConfig() {
  try { const r = await fetch(`${API_BASE}/api/auth/firebase/config`); if (r.ok) return r.json(); } catch {}
  return { enabled: false };
}
