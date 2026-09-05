'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.analyticsOverview(), adminApi.signupSeries(30), adminApi.taskSeries(30)])
      .then(([o, s, t]) => { setOverview(o); setSignups(s.days || []); setTasks(t.days || []); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!overview) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const tile = (k: string, v: any) => (
    <div key={k} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
      <div className="text-xs text-on-surface-variant uppercase">{k.replace(/([A-Z])/g, ' $1')}</div>
      <div className="text-2xl font-bold">{String(v)}</div>
    </div>
  );

  const bars = (data: any[], valueKey: string, label: string) => {
    const max = Math.max(1, ...data.map((d) => Number(d[valueKey] || 0)));
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-3">
        <div className="font-semibold mb-2">{label} (last {data.length} days)</div>
        <div className="flex items-end gap-1 h-24">
          {data.map((d) => (
            <div key={d.day} title={`${d.day}: ${d[valueKey]}`} style={{ height: `${(Number(d[valueKey] || 0) / max) * 100}%` }} className="flex-1 bg-secondary rounded-t min-w-[4px]" />
          ))}
        </div>
      </div>
    );
  };

  const groups: [string, string][] = [
    ['Users', 'users'],
    ['KYC approved', 'kyc.approved'],
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {tile('users', overview.users)}
        {tile('tasks', overview.tasks)}
        {tile('completedTasks', overview.completedTasks)}
        {tile('disputes', overview.disputes)}
        {tile('hires', overview.hires)}
        {tile('gmv', overview.gmv)}
        {tile('signups24h', overview.activity?.signups24h)}
        {tile('logins24h', overview.activity?.logins24h)}
      </div>

      {bars(signups, 'total', 'Signups')}
      {bars(tasks, 'total', 'Tasks created')}
      {bars(tasks, 'completed', 'Tasks completed')}
    </div>
  );
}
