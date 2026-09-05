'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

const STATUSES = ['', 'OPEN', 'UNDER_REVIEW', 'RESOLVED_CUSTOMER', 'RESOLVED_TASKER', 'RESOLVED_SPLIT', 'CLOSED', 'ESCALATED'];

export default function AdminDisputesPage() {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = () => adminApi.disputes({ status: status || undefined }).then((j) => setItems(j.items)).catch((e) => setErr(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Disputes</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container"><tr>
            <th className="text-left p-3">Task</th><th className="text-left p-3">Opener</th><th className="text-left p-3">Against</th>
            <th className="text-left p-3">Reason</th><th className="text-left p-3">Status</th><th className="text-left p-3">Updated</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t border-outline-variant">
                <td className="p-3 max-w-xs truncate" title={d.task?.title}>{d.task?.title || '—'}</td>
                <td className="p-3 text-xs">{d.opener?.displayName || d.opener?.email}</td>
                <td className="p-3 text-xs">{d.against?.displayName || d.against?.email}</td>
                <td className="p-3">{d.reason}</td>
                <td className="p-3 text-xs">{d.status}</td>
                <td className="p-3 text-xs">{new Date(d.updatedAt).toLocaleString()}</td>
                <td className="p-3">
                  <a href={`/admin/disputes/${d.id}`} className="text-secondary font-semibold">Open →</a>
                </td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={7} className="p-6 text-center text-on-surface-variant">No disputes</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
