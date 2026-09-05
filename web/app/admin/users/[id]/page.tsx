'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!id) return;
    Promise.all([adminApi.user(id), adminApi.listNotes(id)])
      .then(([u, n]) => { setUser(u.user); setNotes(n.notes); })
      .catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (err) return <div className="p-6 bg-error-container text-on-error-container rounded-xl m-6">{err}</div>;
  if (!user) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const doAction = (label: string, fn: () => Promise<any>) => {
    if (!confirm(`${label}?`)) return;
    setBusy(true);
    fn().then(() => { setBusy(false); load(); }).catch((e) => { setBusy(false); setErr(e.message); });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{user.displayName || user.email}</h1>
          <p className="text-on-surface-variant text-sm">{user.email} · {user.phone || 'no phone'}</p>
        </div>
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => doAction('Ban this user', () => adminApi.setUserStatus(user.id, 'BANNED', 'banned from admin UI'))} className="px-3 py-1.5 rounded-lg bg-error text-on-error font-semibold disabled:opacity-50">Ban</button>
          <button disabled={busy} onClick={() => doAction('Unban', () => adminApi.setUserStatus(user.id, 'ACTIVE'))} className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-semibold disabled:opacity-50">Unban</button>
          <button disabled={busy} onClick={() => doAction('Force KYC approve', () => adminApi.setUserKyc(user.id, 'APPROVED', 'admin override'))} className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface disabled:opacity-50">Force KYC ✓</button>
          <button disabled={busy} onClick={() => doAction('Force KYC reject', () => adminApi.setUserKyc(user.id, 'REJECTED', 'admin override'))} className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface disabled:opacity-50">Force KYC ✗</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Profile">
          <Row k="ID" v={<code className="text-xs">{user.id}</code>} />
          <Row k="Role" v={user.role} />
          <Row k="Status" v={user.status} />
          <Row k="KYC" v={`${user.kycStatus}${user.kycCountry ? ` (${user.kycCountry})` : ''}`} />
          <Row k="Country" v={user.country} />
          <Row k="Currency" v={user.currency} />
          <Row k="Email verified" v={String(user.emailVerified)} />
          <Row k="Phone verified" v={String(user.phoneVerified)} />
          <Row k="Risk score" v={user.riskScore} />
          <Row k="Created" v={new Date(user.createdAt).toLocaleString()} />
          <Row k="Last login" v={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'} />
          <div className="mt-3 pt-3 border-t border-outline-variant">
            <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Change role</div>
            <select value={user.role} onChange={(e) => doAction(`Change role to ${e.target.value}`, () => adminApi.setUserRole(user.id, e.target.value))} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="TASKER">TASKER</option>
              <option value="SUPPORT">SUPPORT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </Card>

        <Card title="Tasker profile" className="lg:col-span-2">
          {user.taskerProfile ? (
            <>
              <Row k="Headline" v={user.taskerProfile.headline || '—'} />
              <Row k="Bio" v={user.taskerProfile.bio || '—'} />
              <Row k="Experience" v={`${user.taskerProfile.experienceYears} years`} />
              <Row k="Travel radius" v={`${user.taskerProfile.travelRadiusKm} km`} />
              <Row k="Remote OK" v={String(user.taskerProfile.remoteOk)} />
              <Row k="Rating" v={`${user.taskerProfile.ratingAvg?.toFixed(2) || 0} (${user.taskerProfile.ratingCount} reviews)`} />
              <Row k="Completed" v={user.taskerProfile.completedCount} />
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase text-on-surface-variant mb-1">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {user.taskerProfile.skills?.map((s: any) => <span key={s.skillId} className="px-2 py-0.5 bg-surface-container rounded text-xs">{s.skill.name}</span>)}
                </div>
              </div>
            </>
          ) : <div className="text-on-surface-variant text-sm">No tasker profile</div>}
        </Card>
      </div>

      <Card title="KYC submissions" className="mt-4">
        {user.kycSubmissions?.length ? (
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Mode</th><th className="text-left p-2">Status</th><th className="text-left p-2">Submitted</th><th className="text-left p-2">Value</th><th className="text-left p-2">File</th></tr></thead>
            <tbody>
              {user.kycSubmissions.map((s: any) => (
                <tr key={s.id} className="border-t border-outline-variant">
                  <td className="p-2 font-mono text-xs">{s.mode}</td>
                  <td className="p-2">{s.status}</td>
                  <td className="p-2 text-xs">{new Date(s.submittedAt).toLocaleString()}</td>
                  <td className="p-2 text-xs">{s.value ? '•••••' : '—'}</td>
                  <td className="p-2">{s.fileUrl ? <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-secondary">View</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-on-surface-variant text-sm">No KYC submissions</div>}
      </Card>

      <Card title="Internal notes" className="mt-4">
        <div className="space-y-2 mb-3">
          {notes.map((n: any) => (
            <div key={n.id} className="bg-surface-container rounded-lg p-3 text-sm">
              <div className="text-xs text-on-surface-variant mb-1">{n.author?.displayName || n.author?.email} · {new Date(n.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{n.body}</div>
            </div>
          ))}
          {notes.length === 0 ? <div className="text-on-surface-variant text-sm">No notes yet.</div> : null}
        </div>
        <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note (visible to admins only)" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low min-h-[80px]" />
        <div className="mt-2 flex justify-end">
          <button disabled={!newNote.trim() || busy} onClick={() => adminApi.addNote(user.id, newNote).then(() => { setNewNote(''); load(); }).catch((e) => setErr(e.message))} className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold disabled:opacity-50">Add note</button>
        </div>
      </Card>

      <Card title="Recent sessions" className="mt-4">
        {user.sessions?.length ? (
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Created</th><th className="text-left p-2">IP</th><th className="text-left p-2">User agent</th></tr></thead>
            <tbody>
              {user.sessions.map((s: any) => (
                <tr key={s.id} className="border-t border-outline-variant">
                  <td className="p-2 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="p-2 text-xs font-mono">{s.ip || '—'}</td>
                  <td className="p-2 text-xs truncate max-w-md">{s.userAgent || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-on-surface-variant text-sm">No active sessions</div>}
      </Card>
    </div>
  );
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant ${className}`}>
      <div className="px-4 py-3 border-b border-outline-variant font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm">
      <div className="text-on-surface-variant">{k}</div>
      <div className="col-span-2">{v}</div>
    </div>
  );
}
