'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminKycPage() {
  const [status, setStatus] = useState('PENDING');
  const [country, setCountry] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    adminApi.kycSubmissions({ status: status || undefined, country: country || undefined })
      .then((j) => setItems(j.items))
      .catch((e) => setErr(e.message));
  };
  useEffect(() => {
    load();
    adminApi.kycFunnel().then(setFunnel).catch(() => null);
    /* eslint-disable-next-line */
  }, [status, country]);

  const review = (id: string, action: 'approve' | 'reject') => {
    const reason = action === 'reject' ? prompt('Reason for rejection?') || '' : undefined;
    adminApi.reviewKyc(id, action, reason).then(() => load()).catch((e) => setErr(e.message));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">KYC review</h1>

      {funnel ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {funnel.byStatus.map((b: any) => (
            <div key={b.kycStatus} className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant">
              <div className="text-xs uppercase font-semibold text-on-surface-variant">{b.kycStatus}</div>
              <div className="text-2xl font-bold">{b._count}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4 flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} placeholder="Country" maxLength={2} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
      </div>

      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Country</th>
              <th className="text-left p-3">Mode</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">File</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-outline-variant">
                <td className="p-3">
                  <div className="font-semibold text-sm">{s.user?.displayName || '—'}</div>
                  <div className="text-xs text-on-surface-variant font-mono">{s.user?.email}</div>
                </td>
                <td className="p-3">{s.user?.country}</td>
                <td className="p-3 font-mono text-xs">{s.mode}</td>
                <td className="p-3 text-xs">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="p-3">{s.fileUrl ? <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-secondary">View</a> : (s.value ? <span className="text-xs font-mono">{s.value.slice(0, 4)}…</span> : '—')}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">
                  {s.status === 'PENDING' ? (
                    <div className="flex gap-1">
                      <button onClick={() => review(s.id, 'approve')} className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-xs font-semibold">Approve</button>
                      <button onClick={() => review(s.id, 'reject')} className="px-2 py-0.5 rounded bg-error text-on-error text-xs font-semibold">Reject</button>
                    </div>
                  ) : <span className="text-on-surface-variant text-xs">reviewed</span>}
                </td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={7} className="p-6 text-center text-on-surface-variant">No submissions</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
