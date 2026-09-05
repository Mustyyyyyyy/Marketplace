'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { Greeting } from '@/components/DashboardBits';

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [prefs, setPrefs] = useState<any>({ emailOffers: true, emailMessages: true, emailMarketing: false, pushOffers: true, pushMessages: true });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem('access') || '';
    fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => setMe(j.user));
    fetch('/api/backend/api/notifications/preferences', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.json()).then((j) => { if (j.preferences) setPrefs((p: any) => ({ ...p, ...j.preferences })); }).catch(() => {});
  }, []);

  const savePrefs = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      const access = localStorage.getItem('access') || '';
      const r = await fetch('/api/backend/api/notifications/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify(prefs) });
      if (!r.ok) throw new Error('Save failed');
      setMsg('Saved');
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  const requestPwd = async () => {
    setMsg(null);
    try {
      await fetch('/api/backend/api/auth/password/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: me?.email }) });
      setMsg('If the email is on file, we sent a reset link.');
    } catch { setMsg('Request failed.'); }
  };

  return (
    <DashboardShell>
      <Greeting name="settings" subtitle="Notification preferences, account controls, and privacy choices — all in one place." />
      {msg ? <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-sm text-sm mb-space-md max-w-2xl">{msg}</div> : null}
      <div className="space-y-space-lg max-w-3xl">
        <form onSubmit={savePrefs} className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">Notification preferences</h2>
          {[
            { k: 'emailOffers', label: 'Email me when I get a new offer' },
            { k: 'emailMessages', label: 'Email me when I get a new message' },
            { k: 'emailMarketing', label: 'Send me product updates and tips' },
            { k: 'pushOffers', label: 'Push notification for new offers' },
            { k: 'pushMessages', label: 'Push notification for new messages' },
          ].map((row) => (
            <label key={row.k} className="flex items-center justify-between gap-space-md py-space-sm border-b border-outline-variant last:border-0">
              <span className="font-body-md text-body-md text-on-surface">{row.label}</span>
              <input type="checkbox" checked={!!prefs[row.k]} onChange={(e) => setPrefs({ ...prefs, [row.k]: e.target.checked })} />
            </label>
          ))}
          <button disabled={busy} className="px-space-lg py-space-md rounded-xl bg-primary-container text-on-secondary-container font-label-lg text-label-lg font-bold disabled:opacity-60">Save preferences</button>
        </form>
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Signed in as <strong>{me?.email}</strong></p>
          <div className="flex flex-wrap gap-space-sm">
            <Link href="/dashboard/profile" className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Edit profile</Link>
            <Link href="/dashboard/kyc" className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Identity verification</Link>
            <button onClick={requestPwd} className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Send password reset email</button>
          </div>
        </div>
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold">Privacy &amp; data</h2>
          <ul className="list-disc pl-space-lg text-on-surface-variant font-body-md text-body-md space-y-1">
            <li><Link className="text-secondary font-semibold" href="/privacy">Read the privacy policy</Link></li>
            <li><Link className="text-secondary font-semibold" href="/cookies">Manage cookie preferences</Link></li>
            <li><Link className="text-secondary font-semibold" href="/contact">Request a data export or deletion</Link></li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
