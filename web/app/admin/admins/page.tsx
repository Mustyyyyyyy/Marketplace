'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SUPPORT'>('ADMIN');

  const load = () => Promise.all([adminApi.admins(), adminApi.invites()])
    .then(([a, i]) => { setAdmins(a.admins || []); setInvites(i.invites || []); })
    .catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const invite = () => {
    if (!email) return;
    adminApi.createInvite({ email, role }).then(() => { setEmail(''); load(); }).catch((e) => setErr(e.message));
  };
  const revoke = (id: string) => { if (confirm('Revoke this invite?')) adminApi.revokeInvite(id).then(load).catch((e) => setErr(e.message)); };
  const setRole_ = (id: string, r: string) => adminApi.setUserRole(id, r).then(load).catch((e) => setErr(e.message));
  const remove = (id: string) => { if (confirm('Remove admin role?')) adminApi.removeAdmin(id).then(load).catch((e) => setErr(e.message)); };

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin management</h1>

      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Invite a new admin</div>
        <div className="flex gap-2 flex-wrap">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
          <select value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SUPPORT')} className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
            <option value="ADMIN">ADMIN</option>
            <option value="SUPPORT">SUPPORT</option>
          </select>
          <button onClick={invite} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold">Send invite</button>
        </div>
        <div className="text-xs text-on-surface-variant mt-2">Invites also let existing users accept via <code className="bg-surface-container px-1 rounded">/api/admin/invites/accept</code> with the token emailed to them.</div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-4">
        <div className="font-semibold mb-2">Current admins & support</div>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Email</th><th className="text-left p-2">Role</th><th className="p-2"></th></tr></thead>
          <tbody>
            {admins.map((u) => (
              <tr key={u.id} className="border-t border-outline-variant">
                <td className="p-2">{u.displayName || '—'}</td>
                <td className="p-2 text-xs">{u.email}</td>
                <td className="p-2">
                  <select defaultValue={u.role} onChange={(e) => setRole_(u.id, e.target.value)} className="px-2 py-1 rounded border border-outline-variant bg-surface-container-low text-xs">
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="TASKER">TASKER</option>
                  </select>
                </td>
                <td className="p-2"><button onClick={() => remove(u.id)} className="text-error text-xs">Remove</button></td>
              </tr>
            ))}
            {admins.length === 0 ? <tr><td colSpan={4} className="p-4 text-on-surface-variant">No admins</td></tr> : null}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
        <div className="font-semibold mb-2">Pending invites</div>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">Email</th><th className="text-left p-2">Role</th><th className="text-left p-2">Expires</th><th className="p-2"></th></tr></thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id} className="border-t border-outline-variant">
                <td className="p-2 text-xs">{i.email}</td>
                <td className="p-2 text-xs">{i.role}</td>
                <td className="p-2 text-xs">{new Date(i.expiresAt).toLocaleDateString()}</td>
                <td className="p-2"><button onClick={() => revoke(i.id)} className="text-error text-xs">Revoke</button></td>
              </tr>
            ))}
            {invites.length === 0 ? <tr><td colSpan={4} className="p-4 text-on-surface-variant">No pending invites</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
