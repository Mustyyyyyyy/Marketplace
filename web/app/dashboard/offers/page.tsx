'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/offers/mine', { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => r.json()).then((j) => setOffers(j.offers || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? offers : offers.filter((o) => o.status === filter);
  const accepted = offers.filter((o) => o.status === 'ACCEPTED').length;
  const pending = offers.filter((o) => ['SUBMITTED', 'PENDING'].includes(o.status)).length;
  const winRate = offers.length > 0 ? Math.round((accepted / offers.length) * 100) : 0;
  const totalValue = offers.filter((o) => o.status === 'ACCEPTED').reduce((s, o) => s + Number(o.price || 0), 0);

  return (
    <DashboardShell>
      <Greeting name="your offers" subtitle="Every proposal you\u2019ve sent. Track acceptances, revisions, and revenue from a single view." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Active Offers" value={pending} icon="local_offer" tone="info" />
        <StatCard label="Accepted" value={accepted} icon="verified" tone="success" />
        <StatCard label="Win Rate" value={`${winRate}%`} icon="trending_up" tone="success" trend="up" />
        <StatCard label="Earnings" value={`$${totalValue.toLocaleString()}`} icon="payments" tone="neutral" />
      </section>

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap gap-1 mb-space-md">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === s ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>{s}</button>
          ))}
        </div>
        {loading ? <p className="text-on-surface-variant py-space-xl text-center">Loading…</p> : filtered.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">workspace_premium</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">No offers yet.</p>
            <Link href="/dashboard/find-tasks" className="inline-block mt-space-md px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold">Browse open tasks</Link>
          </div>
        ) : (
          <div className="space-y-space-sm">
            {filtered.map((o) => (
              <Link key={o.id} href={`/tasks/${o.taskId}`} className="block p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{o.task?.title || 'Task'}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">{o.proposal}</p>
                  </div>
                  <span className={`px-space-sm py-1 rounded-full text-[10px] font-bold uppercase ${o.status === 'ACCEPTED' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : o.status === 'REJECTED' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'}`}>{o.status}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-space-sm">
                  <span className="px-space-sm py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">{o.currency} {Number(o.price).toLocaleString()}</span>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase">{o.timelineDays} days</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
