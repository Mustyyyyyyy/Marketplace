'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => adminApi.getSettings().then((j) => setSettings(j || {})).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const save = () => {
    setBusy(true); setErr(null); setMsg(null);
    adminApi.updateSettings(settings).then(() => { setMsg('Saved.'); setBusy(false); }).catch((e) => { setErr(e.message); setBusy(false); });
  };

  const set = (k: string, v: any) => setSettings((s: any) => ({ ...s, [k]: v }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Site settings</h1>
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-3 mb-4 text-sm">{err}</div> : null}
      {msg ? <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-3 mb-4 text-sm">{msg}</div> : null}

      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Identity</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label>Site name<input value={settings.siteName || ''} onChange={(e) => set('siteName', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
          <label>Default country (ISO-2)<input value={settings.defaultCountry || ''} onChange={(e) => set('defaultCountry', e.target.value.toUpperCase())} maxLength={2} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
          <label>Default currency (ISO-3)<input value={settings.defaultCurrency || ''} onChange={(e) => set('defaultCurrency', e.target.value.toUpperCase())} maxLength={3} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
          <label>Support email<input type="email" value={settings.supportEmail || ''} onChange={(e) => set('supportEmail', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Operations</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!settings.maintenanceMode} onChange={(e) => set('maintenanceMode', e.target.checked)} /> Maintenance mode</label>
          <label>KYC requirement
            <select value={settings.kycRequiredFor || 'all'} onChange={(e) => set('kycRequiredFor', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low">
              <option value="all">All users</option>
              <option value="taskers-only">Taskers only</option>
              <option value="off">Off</option>
            </select>
          </label>
        </div>
        <label className="block text-sm mt-3">Maintenance message
          <textarea value={settings.maintenanceMessage || ''} onChange={(e) => set('maintenanceMessage', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low min-h-[60px]" />
        </label>
        <label className="block text-sm mt-3">Banned email domains (comma separated)
          <input value={(settings.bannedEmailDomains || []).join(',')} onChange={(e) => set('bannedEmailDomains', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" />
        </label>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant mb-4">
        <div className="text-xs font-semibold uppercase text-on-surface-variant mb-2">Legal</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label>Terms URL<input value={settings.termsUrl || ''} onChange={(e) => set('termsUrl', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
          <label>Privacy URL<input value={settings.privacyUrl || ''} onChange={(e) => set('privacyUrl', e.target.value)} className="block w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low" /></label>
        </div>
      </div>

      <button onClick={save} disabled={busy} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save settings'}</button>
    </div>
  );
}
