'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';

const STATUSES = ['', 'DRAFT', 'PUBLISHED', 'RECEIVING_OFFERS', 'OFFER_SELECTED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'CUSTOMER_REVIEW', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED', 'SUSPENDED'];

export default function AdminTasksPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const load = () => adminApi.tasks({ q: q || undefined, status: status || undefined }).then((j) => { setItems(j.items); setTotal(j.total); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title" className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Search</button>
      </div>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      <div className="text-sm text-on-surface-variant mb-2">{total} total</div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container"><tr>
            <th className="text-left p-3">Title</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Status</th>
            <th className="text-left p-3">Offers</th><th className="text-left p-3">Budget</th><th className="text-left p-3">Country</th>
            <th className="text-left p-3">Created</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-outline-variant">
                <td className="p-3 max-w-xs truncate" title={t.title}>{t.title}</td>
                <td className="p-3 text-xs">{t.customer?.displayName || t.customer?.email}</td>
                <td className="p-3 text-xs">{t.status}</td>
                <td className="p-3">{t._count?.offers ?? 0}</td>
                <td className="p-3 text-xs font-mono">{t.budgetAmount} {t.currency}</td>
                <td className="p-3">{t.country}</td>
                <td className="p-3 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><Link href={`/admin/tasks/${t.id}`} className="text-secondary font-semibold">Open →</Link></td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={8} className="p-6 text-center text-on-surface-variant">No tasks</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
