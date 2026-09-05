'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Greeting, StatCard } from '@/components/DashboardBits';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async () => {
    const access = localStorage.getItem('access') || '';
    const r = await fetch('/api/backend/api/notifications', { headers: { Authorization: `Bearer ${access}` } });
    if (r.ok) { const j = await r.json(); setItems(j.items || []); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    const access = localStorage.getItem('access') || '';
    await fetch(`/api/backend/api/notifications/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
    load();
  };
  const markAll = async () => {
    const access = localStorage.getItem('access') || '';
    await fetch('/api/backend/api/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
    load();
  };

  const filtered = filter === 'unread' ? items.filter((n) => !n.readAt) : items;
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <DashboardShell>
      <Greeting
        name="your notifications"
        subtitle="Activity that needs your attention. Offers, milestones, messages, and system updates."
        action={
          <button onClick={markAll} className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Mark all as read</button>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <StatCard label="Unread" value={unread} icon="notifications" tone={unread ? 'warning' : 'success'} />
        <StatCard label="Total" value={items.length} icon="inbox" tone="neutral" />
        <StatCard label="Today" value={items.filter((n) => new Date(n.createdAt).toDateString() === new Date().toDateString()).length} icon="today" tone="info" />
        <StatCard label="This week" value={items.filter((n) => Date.now() - new Date(n.createdAt).getTime() < 7 * 86400_000).length} icon="calendar" tone="neutral" />
      </section>

      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap gap-1 mb-space-md">
          <button onClick={() => setFilter('all')} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === 'all' ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-space-sm py-1 rounded-full font-label-md text-label-md ${filter === 'unread' ? 'bg-primary-container text-on-secondary-container' : 'bg-surface-container text-on-surface'}`}>Unread only</button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-space-3xl">
            <span className="material-symbols-outlined text-6xl text-outline">notifications_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md">You\u2019re all caught up.</p>
          </div>
        ) : (
          <div className="space-y-space-sm">
            {filtered.map((n) => (
              <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all ${n.readAt ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-space-sm">
                  <span className="p-2 rounded-xl bg-surface-container text-secondary"><span className="material-symbols-outlined text-[18px]">{iconForType(n.type)}</span></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-label-lg text-label-lg font-bold text-on-surface">{n.title}</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{n.body}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function iconForType(t: string) {
  if (!t) return 'notifications';
  if (t.includes('OFFER')) return 'local_offer';
  if (t.includes('MESSAGE')) return 'forum';
  if (t.includes('TASK')) return 'task_alt';
  if (t.includes('PAYMENT')) return 'payments';
  if (t.includes('REVIEW')) return 'star';
  if (t.includes('DISPUTE')) return 'gavel';
  return 'notifications';
}
