'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks/mine', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.json()).then((j) => setTasks(j.tasks || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const stats = {
    active: tasks.filter((t) => ['PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'IN_PROGRESS'].includes(t.status)).length,
    offers: tasks.filter((t) => t.status === 'RECEIVING_OFFERS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    spent: tasks.filter((t) => t.status === 'COMPLETED').reduce((s, t) => s + Number(t.budgetAmount || 0), 0),
  };

  return (
    <DashboardShell>
      <Greeting
        name="your tasks"
        subtitle="Track every job you\u2019ve posted, from open offers to completed milestones."
        action={
          <Link href="/dashboard/tasks/new" className="inline-flex items-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg shadow-sm hover:bg-inverse-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">post_add</span>
            <span>New Task</span>
          </Link>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Active" value={stats.active} icon="task_alt" tone="info" />
        <StatCard label="Receiving Offers" value={stats.offers} icon="local_offer" tone="success" />
        <StatCard label="Completed" value={stats.completed} icon="verified" tone="success" />
        <StatCard label="Total Spent" value={`$${stats.spent.toLocaleString()}`} icon="payments" tone="neutral" />
      </section>

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
          <div className="flex flex-wrap gap-1">
            {['all', 'DRAFT', 'PUBLISHED', 'RECEIVING_OFFERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === s ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>{s.replace('_', ' ')}</button>
            ))}
          </div>
          <div className="flex p-1 bg-surface-container rounded-xl">
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-lg font-label-sm text-label-sm ${view === 'list' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'}`}>List</button>
            <button onClick={() => setView('grid')} className={`px-3 py-1 rounded-lg font-label-sm text-label-sm ${view === 'grid' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'}`}>Grid</button>
          </div>
        </div>

        {loading ? <p className="text-on-surface-variant py-space-xl text-center">Loading…</p> : filtered.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">inbox</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No tasks here yet.</p>
            <Link href="/dashboard/tasks/new" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Post your first task</Link>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-space-sm">
            {filtered.map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`} className="block p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{t.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">{t.description}</p>
                  </div>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold uppercase whitespace-nowrap">{t.status.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-space-sm">
                  <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.mode}</span>
                  {t.city ? <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{t.city}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {filtered.map((t) => (
              <Link key={t.id} href={`/tasks/${t.id}`} className="block p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container">
                <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold uppercase">{t.status.replace('_', ' ')}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm truncate">{t.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{t.description}</p>
                <div className="font-label-lg text-label-lg font-bold text-secondary mt-space-sm">{t.currency} {Number(t.budgetAmount).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
