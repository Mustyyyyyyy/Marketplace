'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminAuditPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');

  const load = () => adminApi.auditLogs({ actor: actor || undefined, action: action || undefined }).then((j) => setItems(j.items || [])).catch((e) => setErr(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Audit log</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4 flex gap-2">
        <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Actor email" className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action (e.g. user.ban)" className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        <button onClick={load} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Filter</button>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container"><tr>
            <th className="text-left p-3">When</th><th className="text-left p-3">Actor</th>
            <th className="text-left p-3">Action</th><th className="text-left p-3">Target</th>
            <th className="text-left p-3">Meta</th>
          </tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-outline-variant">
                <td className="p-3 text-xs whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="p-3 text-xs">{a.actor?.email || '—'}</td>
                <td className="p-3 font-mono text-xs">{a.action}</td>
                <td className="p-3 text-xs">{a.targetType}:{a.targetId}</td>
                <td className="p-3 text-xs"><pre className="whitespace-pre-wrap max-w-md">{a.meta ? JSON.stringify(a.meta, null, 0) : ''}</pre></td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-on-surface-variant">No entries</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
