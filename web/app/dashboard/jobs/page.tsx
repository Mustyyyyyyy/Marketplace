'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function MyJobsPage() {
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/tasks?pageSize=20', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.json()).then((j) => setTasks(j.items || [])).finally(() => setLoading(false));
    fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setProfile(j.profile)).catch(() => {});
  }, []);

  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OFFER_SELECTED').length;
  const review = tasks.filter((t) => t.status === 'SUBMITTED' || t.status === 'CUSTOMER_REVIEW').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const onTime = completed === 0 ? '—' : (profile?.taskerProfile?.ratingAvg && profile.taskerProfile.ratingAvg >= 4.5 ? 'High' : '—');

  return (
    <DashboardShell>
      <Greeting name="your jobs" subtitle="Active contracts you\u2019re working on, plus the full project pipeline at a glance." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="In Progress" value={inProgress} hint="Next milestone due Friday" icon="work" tone="info" />
        <StatCard label="Awaiting Review" value={review} icon="hourglass_top" tone="warning" />
        <StatCard label="Completed" value={completed} icon="verified" tone="success" />
        <StatCard label="On-time rate" value={onTime} icon="alarm" tone={onTime === 'High' ? 'success' : 'neutral'} />
      </section>

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
          <div className="flex p-1 bg-surface-container rounded-xl">
            {['All', 'In Progress', 'Review', 'Completed'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-lg font-label-sm text-label-sm ${filter === s ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>{s}</button>
            ))}
          </div>
          <Link href="/dashboard/find-tasks" className="font-label-md text-label-md text-secondary font-semibold hover:underline">Find more work →</Link>
        </div>
        {loading ? <p className="text-on-surface-variant py-space-xl text-center">Loading…</p> : tasks.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">work_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No active jobs yet.</p>
            <Link href="/dashboard/find-tasks" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Browse open tasks</Link>
          </div>
        ) : (
          <div className="space-y-space-sm">
            {tasks.map((t) => (
              <div key={t.id} className="p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">{(t.author?.displayName || '?')[0]?.toUpperCase()}</div>
                      <div className="min-w-0">
                        <h3 className="font-label-lg text-label-lg font-bold text-on-surface truncate">{t.title}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{t.author?.displayName || 'Customer'} · {t.city || t.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">{t.status}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-secondary">{t.currency} {Number(t.budgetAmount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm mt-space-md">
                  <Link href={`/dashboard/messages`} className="px-space-md py-1.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Message</Link>
                  <Link href={`/tasks/${t.id}`} className="px-space-md py-1.5 rounded-xl bg-primary-container text-on-secondary-container font-label-md text-label-md font-semibold">Open workspace</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
