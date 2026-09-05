'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminUser } from '@/lib/admin';

const STATUSES = ['', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'BANNED'];
const ROLES = ['', 'CUSTOMER', 'TASKER', 'ADMIN', 'SUPPORT'];
const KYC = ['', 'NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];

export default function AdminUsersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [kycStatus, setKycStatus] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AdminUser[]; total: number; pages: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setErr(null);
    adminApi.users({ q: q || undefined, role: role || undefined, status: status || undefined, kycStatus: kycStatus || undefined, country: country || undefined, page })
      .then(setData)
      .catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Users</h1>
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, name, phone" className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low md:col-span-2" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            <option value="">All roles</option>
            {ROLES.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={kycStatus} onChange={(e) => setKycStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            <option value="">All KYC</option>
            {KYC.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} placeholder="Country (e.g. NG)" maxLength={2} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Search</button>
          <button onClick={() => { setQ(''); setRole(''); setStatus(''); setKycStatus(''); setCountry(''); setPage(1); setTimeout(load, 0); }} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface">Reset</button>
        </div>
      </div>

      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">KYC</th>
              <th className="text-left p-3">Country</th>
              <th className="text-left p-3">Risk</th>
              <th className="text-left p-3">Joined</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id} className="border-t border-outline-variant hover:bg-surface-container">
                <td className="p-3 font-mono text-xs">{u.email}</td>
                <td className="p-3">{u.displayName || '—'}</td>
                <td className="p-3"><Pill>{u.role}</Pill></td>
                <td className="p-3"><Pill tone={u.status === 'BANNED' ? 'error' : u.status === 'ACTIVE' ? 'success' : 'warning'}>{u.status}</Pill></td>
                <td className="p-3"><Pill tone={u.kycStatus === 'APPROVED' ? 'success' : u.kycStatus === 'REJECTED' ? 'error' : 'warning'}>{u.kycStatus}</Pill></td>
                <td className="p-3">{u.country}</td>
                <td className="p-3">{u.riskScore}</td>
                <td className="p-3 text-xs text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><Link href={`/admin/users/${u.id}`} className="text-secondary font-semibold">Open →</Link></td>
              </tr>
            ))}
            {data?.items.length === 0 && !err ? (
              <tr><td colSpan={9} className="p-6 text-center text-on-surface-variant">No users found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 ? (
        <div className="flex justify-between items-center mt-3 text-sm">
          <div>Page {data.pages > 0 ? page : 0} of {data.pages} — {data.total} total</div>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-outline-variant disabled:opacity-40">Prev</button>
            <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-outline-variant disabled:opacity-40">Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'error' }) {
  const colors: Record<string, string> = {
    default: 'bg-surface-container text-on-surface',
    success: 'bg-tertiary-fixed text-on-tertiary-fixed',
    warning: 'bg-secondary-fixed text-on-secondary-fixed',
    error: 'bg-error-container text-on-error-container',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[tone]}`}>{children}</span>;
}
