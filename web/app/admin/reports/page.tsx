'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminReportsPage() {
  const [tab, setTab] = useState<'users' | 'messages'>('users');
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    const p = tab === 'users' ? adminApi.reports(1) : adminApi.messageReports(1);
    p.then((j) => setItems(j.items)).catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const act = (id: string, action: string) => {
    const fn = tab === 'users' ? adminApi.actionReport(id, action) : adminApi.actionMessageReport(id, action);
    fn.then(() => load()).catch((e) => setErr(e.message));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Reports</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('users')} className={`px-3 py-1.5 rounded-lg ${tab === 'users' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant'}`}>User / task reports</button>
        <button onClick={() => setTab('messages')} className={`px-3 py-1.5 rounded-lg ${tab === 'messages' ? 'bg-secondary text-on-secondary' : 'border border-outline-variant'}`}>Message reports</button>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        {tab === 'users' ? (
          <table className="w-full text-sm">
            <thead className="bg-surface-container"><tr>
              <th className="text-left p-3">Reporter</th><th className="text-left p-3">Target</th>
              <th className="text-left p-3">Reason</th><th className="text-left p-3">Task</th>
              <th className="text-left p-3">When</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-outline-variant">
                  <td className="p-3 text-xs">{r.reporter?.email}</td>
                  <td className="p-3 text-xs">{r.targetUser?.email || '—'}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3 text-xs">{r.task?.title || '—'}</td>
                  <td className="p-3 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => act(r.id, 'dismiss')} className="px-2 py-0.5 rounded border border-outline-variant text-xs">Dismiss</button>
                    <button onClick={() => act(r.id, 'ban')} className="px-2 py-0.5 rounded bg-error text-on-error text-xs font-semibold">Ban target</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-on-surface-variant">No reports</td></tr> : null}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container"><tr>
              <th className="text-left p-3">Reporter</th><th className="text-left p-3">Sender</th>
              <th className="text-left p-3">Reason</th><th className="text-left p-3">Message</th>
              <th className="text-left p-3">When</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t border-outline-variant">
                  <td className="p-3 text-xs">{r.reporter?.email}</td>
                  <td className="p-3 text-xs">{r.message?.sender?.displayName || r.message?.senderId}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3 max-w-xs truncate text-xs">{r.message?.body}</td>
                  <td className="p-3 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => act(r.id, 'dismiss')} className="px-2 py-0.5 rounded border border-outline-variant text-xs">Dismiss</button>
                    <button onClick={() => act(r.id, 'remove')} className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-xs font-semibold">Remove</button>
                    <button onClick={() => act(r.id, 'ban')} className="px-2 py-0.5 rounded bg-error text-on-error text-xs font-semibold">Ban sender</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-on-surface-variant">No reports</td></tr> : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
