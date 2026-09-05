'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminRiskPage() {
  const [overview, setOverview] = useState<any>(null);
  const [highRisk, setHighRisk] = useState<any[]>([]);
  const [banned, setBanned] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      adminApi.analyticsOverview(),
      adminApi.highRiskUsers(),
      adminApi.users({ status: 'BANNED', pageSize: 50 }),
    ]).then(([o, h, b]) => { setOverview(o); setHighRisk(h.users || []); setBanned(b.items || []); })
      .catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); }, []);

  const unban = (id: string) => adminApi.setUserStatus(id, 'ACTIVE').then(() => load()).catch((e) => setErr(e.message));

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!overview) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Risk</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { k: 'kycRejected', l: 'KYC rejected' },
          { k: 'openDisputes', l: 'Open disputes' },
          { k: 'escalatedDisputes', l: 'Escalated disputes', val: overview.disputes },
          { k: 'banned', l: 'Banned users', val: banned.length },
        ].map((c) => (
          <div key={c.l} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
            <div className="text-xs text-on-surface-variant uppercase">{c.l}</div>
            <div className="text-2xl font-bold">{c.val ?? overview.kyc?.rejected ?? overview.openDisputes}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
        <div className="font-semibold mb-2">Banned users</div>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">User</th><th className="text-left p-2">Email</th><th className="text-left p-2">Reason</th><th className="p-2"></th></tr></thead>
          <tbody>
            {banned.map((u) => (
              <tr key={u.id} className="border-t border-outline-variant">
                <td className="p-2 text-xs">{u.displayName || '—'}</td>
                <td className="p-2 text-xs">{u.email}</td>
                <td className="p-2 text-xs">{u.banReason || '—'}</td>
                <td className="p-2"><button onClick={() => unban(u.id)} className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-xs font-semibold">Unban</button></td>
              </tr>
            ))}
            {banned.length === 0 ? <tr><td colSpan={4} className="p-4 text-on-surface-variant">No banned users</td></tr> : null}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
        <div className="font-semibold mb-2">High-risk users (score ≥ 50)</div>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">User</th><th className="text-left p-2">Email</th><th className="text-right p-2">Risk score</th><th className="text-left p-2">KYC</th></tr></thead>
          <tbody>
            {highRisk.map((u) => (
              <tr key={u.id} className="border-t border-outline-variant">
                <td className="p-2 text-xs">{u.displayName || '—'}</td>
                <td className="p-2 text-xs">{u.email}</td>
                <td className="p-2 text-right font-mono">{u.riskScore}</td>
                <td className="p-2 text-xs">{u.kycStatus}</td>
              </tr>
            ))}
            {highRisk.length === 0 ? <tr><td colSpan={4} className="p-4 text-on-surface-variant">No high-risk users</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
