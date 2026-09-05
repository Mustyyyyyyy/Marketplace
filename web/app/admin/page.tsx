'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.analyticsOverview(),
      adminApi.signupSeries(30),
      adminApi.taskSeries(30),
    ]).then(([o, s, t]) => {
      setData(o);
      setSignups(s.days);
      setTasks(t.days);
    }).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!data) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Overview</h1>
        <div className="text-sm text-on-surface-variant">Last 30 days</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Users" value={data.users} sub={`+${data.activity.signups7d} this week`} />
        <Stat label="Customers" value={data.customers} sub={`+${data.activity.signups7d} total`} />
        <Stat label="Taskers" value={data.taskers} sub="—" />
        <Stat label="Open tasks" value={data.openTasks} sub={`${data.completedTasks} completed`} />
        <Stat label="Active hires" value={data.hires} sub={`${data.completedHires} completed`} />
        <Stat label="Open disputes" value={data.openDisputes} sub={`${data.disputes} total`} />
        <Stat label="KYC pending" value={data.kyc.pending} sub={`${data.kyc.approved} approved`} />
        <Stat label="GMV" value={formatMoney(data.gmv)} sub="from completed tasks" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Panel title="Signups (30d)">
          <MiniChart data={signups} dataKey="total" />
          <div className="text-xs text-on-surface-variant mt-2">{data.activity.signups30d} signups in the last 30 days</div>
        </Panel>
        <Panel title="Tasks created (30d)">
          <MiniChart data={tasks} dataKey="total" color="#10b981" />
          <div className="text-xs text-on-surface-variant mt-2">{tasks.reduce((a, b) => a + b.total, 0)} tasks created in the last 30 days</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/admin/kyc" title="Review KYC submissions" sub={`${data.kyc.pending} pending`} icon="verified_user" />
        <QuickLink href="/admin/disputes" title="Open disputes" sub={`${data.openDisputes} need attention`} icon="gavel" />
        <QuickLink href="/admin/reports" title="Pending reports" sub="Triage queue" icon="flag" />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant">
      <div className="text-xs font-semibold text-on-surface-variant uppercase">{label}</div>
      <div className="text-3xl font-bold mt-1">{value ?? 0}</div>
      {sub ? <div className="text-xs text-on-surface-variant mt-1">{sub}</div> : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function QuickLink({ href, title, sub, icon }: { href: string; title: string; sub: string; icon: string }) {
  return (
    <Link href={href} className="bg-surface-container-lowest hover:bg-surface-container rounded-xl p-4 border border-outline-variant flex items-center gap-3">
      <span className="material-symbols-outlined text-2xl text-secondary">{icon}</span>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-on-surface-variant">{sub}</div>
      </div>
      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
    </Link>
  );
}

function MiniChart({ data, dataKey, color = '#6366f1' }: { data: any[]; dataKey: string; color?: string }) {
  if (!data || data.length === 0) return <div className="h-24 flex items-center justify-center text-on-surface-variant text-sm">No data</div>;
  const max = Math.max(1, ...data.map((d) => d[dataKey]));
  return (
    <div className="h-24 flex items-end gap-1">
      {data.map((d, i) => (
        <div key={i} title={`${d.day}: ${d[dataKey]}`} style={{ height: `${(d[dataKey] / max) * 100}%`, background: color, minHeight: 2 }} className="flex-1 rounded-t" />
      ))}
    </div>
  );
}

function formatMoney(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
