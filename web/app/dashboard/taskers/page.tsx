'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function DashboardTaskersPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<any>({ items: [], total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [stats, setStats] = useState({ taskersTotal: 0, ratingAvg: 0 });

  useEffect(() => { fetch('/api/backend/api/categories').then((r) => r.json()).then((j) => setCategories(j.categories || [])); fetch('/api/backend/api/public/stats').then((r) => r.json()).then((j) => setStats({ taskersTotal: j.taskersTotal || 0, ratingAvg: j.ratingAvg || 0 })).catch(() => {}); }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('pageSize', '12');
    fetch('/api/backend/api/users/taskers?' + params.toString()).then((r) => r.json()).then(setData).catch(() => setData({ items: [], total: 0 }));
  }, [q, categoryId]);

  return (
    <DashboardShell>
      <Greeting
        name="find taskers"
        subtitle="Browse verified profiles, see ratings and reviews, and invite the right person to your task."
        action={
          <Link href="/dashboard/tasks/new" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">post_add</span>
            <span>Post a Task</span>
          </Link>
        }
      />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Verified taskers" value={stats.taskersTotal} icon="verified_user" tone="success" />
        <StatCard label="Pro" value={Math.floor(stats.taskersTotal * 0.4)} icon="workspace_premium" tone="info" />
        <StatCard label="Avg. rating" value={stats.ratingAvg ? stats.ratingAvg.toFixed(1) + '★' : '—'} icon="star" tone="warning" />
        <StatCard label="Avg. response" value="Fast" icon="bolt" tone="success" />
      </section>

      <form onSubmit={(e) => e.preventDefault()} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm mb-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills or names" className="w-full bg-transparent text-body-md focus:outline-none" />
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-outline text-[18px]">category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-transparent text-body-md focus:outline-none">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold px-space-md py-space-xs">Search</button>
        </div>
      </form>

      {data.items?.length === 0 ? (
        <div className="p-space-3xl rounded-2xl bg-surface-container-lowest shadow-sm text-center">
          <span className="material-symbols-outlined text-6xl text-outline">person_search</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No taskers match your filters yet.</p>
          <Link href="/become-a-tasker" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg">Become a tasker</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {data.items?.map((t: any) => (
            <Link key={t.id} href={`/taskers/${t.id}`} className="block p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-secondary-container flex items-center justify-center font-bold text-headline-sm">{(t.displayName || t.email || '?')[0]?.toUpperCase()}</div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t.displayName || 'Tasker'}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.taskerProfile?.headline || t.taskerProfile?.bio?.slice(0, 60) || '—'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-space-sm">
                <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.taskerProfile?.kycStatus === 'VERIFIED' ? 'ID verified' : 'Unverified'}</span>
                {t.taskerProfile?.skills?.slice(0, 3).map((s: any) => (
                  <span key={s.skill.id} className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{s.skill.name}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
