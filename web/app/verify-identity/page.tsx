'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type KycMode =
  | 'ID_DOCUMENT' | 'NATIONAL_ID_NUMBER' | 'TAX_ID' | 'BANK_VERIFICATION'
  | 'ADDRESS_PROOF' | 'DRIVER_LICENSE' | 'PASSPORT'
  | 'PHONE_OTP' | 'EMAIL_OTP' | 'SELFIE' | 'SANCTIONS_SCREEN';

interface KycModeProgress {
  mode: KycMode;
  label: string;
  helpText: string;
  required: boolean;
  order: number;
  fileBased: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  value?: string | null;
  fileUrl?: string | null;
  submittedAt?: string | null;
}

interface Progress {
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  signupStep: 'PROFILE' | 'KYC' | 'COMPLETE';
  kycCountry: string;
  countryName: string;
  description: string;
  modes: KycModeProgress[];
}

const AUTO_LABEL: Record<KycMode, { icon: string; oneLiner: string }> = {
  EMAIL_OTP: { icon: 'mail', oneLiner: 'Tap to send the verification link to your inbox.' },
  PHONE_OTP: { icon: 'sms', oneLiner: 'Tap to send a 6-digit code by SMS.' },
  SANCTIONS_SCREEN: { icon: 'verified_user', oneLiner: 'Automated — no action required.' },
  ID_DOCUMENT: { icon: 'badge', oneLiner: 'Photo of your ID, passport or driver licence.' },
  ADDRESS_PROOF: { icon: 'receipt_long', oneLiner: 'Utility bill or bank statement (last 3 months).' },
  SELFIE: { icon: 'face', oneLiner: 'A short selfie to confirm you match your ID.' },
  NATIONAL_ID_NUMBER: { icon: 'numbers', oneLiner: 'Your national ID number.' },
  TAX_ID: { icon: 'numbers', oneLiner: 'Your government tax / personal ID number.' },
  BANK_VERIFICATION: { icon: 'account_balance', oneLiner: 'Bank account or BVN for payment verification.' },
  DRIVER_LICENSE: { icon: 'drive_eta', oneLiner: 'A clear photo of your driver licence.' },
  PASSPORT: { icon: 'flight', oneLiner: 'A clear photo of your passport.' },
};

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<KycMode | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  async function load() {
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!access) { router.push('/sign-in'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/backend/api/auth/kyc/progress', { headers: { Authorization: `Bearer ${access}` } });
      if (r.status === 401) { router.push('/sign-in'); return; }
      const j = await r.json();
      setProgress(j);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  async function submitMode(mode: KycModeProgress) {
    if (!progress) return;
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!access) { router.push('/sign-in?next=/verify-identity'); return; }
    setBusy(mode.mode);
    setErr(null);
    try {
      let body: any = { mode: mode.mode };
      if (mode.fileBased) {
        // Trigger file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        const file: File | null = await new Promise((res) => { input.onchange = () => res(input.files?.[0] || null); input.click(); });
        if (!file) { setBusy(null); return; }
        const fd = new FormData();
        fd.append('file', file);
        const up = await fetch('/api/backend/api/uploads/kyc', { method: 'POST', headers: { Authorization: `Bearer ${access}` }, body: fd });
        if (!up.ok) { const j = await up.json().catch(() => ({})); throw new Error(j.error || 'Upload failed'); }
        const u = await up.json();
        body.fileUrl = u.url;
        body.filePublicId = u.publicId;
      } else {
        const v = (values[mode.mode] || '').trim();
        if (!v) throw new Error('Please fill in this field');
        body.value = v;
      }
      const r = await fetch('/api/backend/api/auth/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
        body: JSON.stringify(body),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Submit failed'); }
      await load();
      // If we just finished, route to dashboard
      const me = await fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } });
      const meJ = await me.json();
      if (meJ.user?.kycStatus === 'APPROVED') {
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(null); }
  }

  async function devApprove() {
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!access) return;
    setBusy('SANCTIONS_SCREEN' as any);
    setErr(null);
    try {
      const r = await fetch('/api/backend/api/auth/kyc/dev-approve', { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Dev approve failed'); }
      await load();
      setTimeout(() => router.push('/dashboard'), 600);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(null); }
  }

  if (loading || !progress) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant">Loading…</div>
      </main>
    );
  }

  const required = progress.modes.filter((m) => m.required);
  const done = required.filter((m) => m.status === 'APPROVED').length;
  const pct = required.length === 0 ? 100 : Math.round((done / required.length) * 100);
  const allDone = progress.kycStatus === 'APPROVED';

  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter-mobile py-space-3xl">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-md p-space-xl border border-outline-variant">
        <div className="flex items-center gap-space-sm mb-space-lg">
          <span className="material-symbols-outlined text-3xl text-secondary">task_alt</span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">TaskSphere</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-space-sm py-1 rounded-full text-[10px] font-bold uppercase ${allDone ? 'bg-tertiary text-on-tertiary' : 'bg-secondary text-on-secondary'}`}>
            {allDone ? 'Step 2 complete' : 'Step 2 of 2 · Identity verification'}
          </span>
          <button
            type="button"
            onClick={() => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); router.push('/sign-in'); }}
            className="font-label-sm text-label-sm text-on-surface-variant"
          >
            Sign out
          </button>
        </div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-sm">
          Verify your identity — {progress.countryName}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-md">
          {progress.description}
        </p>

        {/* Progress bar */}
        <div className="mb-space-lg">
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
            <span>{done} of {required.length} required items</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm mb-space-md text-sm">{err}</div> : null}

        <div className="flex flex-col gap-space-md">
          {progress.modes.sort((a, b) => a.order - b.order).map((m) => {
            const isDone = m.status === 'APPROVED';
            const meta = AUTO_LABEL[m.mode] || { icon: 'check', oneLiner: m.label };
            return (
              <div key={m.mode} className={`rounded-2xl border p-space-md ${isDone ? 'border-tertiary bg-tertiary-container' : 'border-outline-variant bg-surface-container-low'}`}>
                <div className="flex items-start gap-space-md">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-tertiary text-on-tertiary' : 'bg-secondary-fixed text-secondary'}`}>
                    <span className="material-symbols-outlined">{isDone ? 'check' : meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-title-md text-title-md font-semibold text-on-surface">{m.label}</h3>
                      {m.required ? <span className="text-[10px] font-bold uppercase text-error">Required</span> : null}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{m.helpText || meta.oneLiner}</p>

                    {isDone ? (
                      <p className="mt-space-sm font-label-md text-label-md font-semibold text-tertiary">✓ Submitted {m.submittedAt ? new Date(m.submittedAt).toLocaleString() : ''}</p>
                    ) : m.fileBased ? (
                      <button
                        disabled={busy === m.mode}
                        onClick={() => submitMode(m)}
                        className="mt-space-sm px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold disabled:opacity-60"
                      >
                        {busy === m.mode ? 'Uploading…' : 'Upload file'}
                      </button>
                    ) : m.mode === 'EMAIL_OTP' ? (
                      <button
                        disabled={busy === m.mode}
                        onClick={() => {
                          setValues((v) => ({ ...v, [m.mode]: 'verified' }));
                          submitMode(m);
                        }}
                        className="mt-space-sm px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold disabled:opacity-60"
                      >
                        {busy === m.mode ? 'Sending…' : 'Send verification link'}
                      </button>
                    ) : m.mode === 'PHONE_OTP' ? (
                      <div className="mt-space-sm flex gap-space-xs">
                        <input
                          type="tel"
                          placeholder={m.placeholder || '+15551234567'}
                          value={values[m.mode] || ''}
                          onChange={(e) => setValues((v) => ({ ...v, [m.mode]: e.target.value }))}
                          className="flex-1 bg-surface-container-lowest px-space-md py-space-xs rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <button
                          disabled={busy === m.mode}
                          onClick={() => submitMode(m)}
                          className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold disabled:opacity-60"
                        >
                          {busy === m.mode ? 'Sending…' : 'Send code'}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-space-sm flex gap-space-xs">
                        <input
                          type="text"
                          placeholder={m.placeholder || ''}
                          value={values[m.mode] || ''}
                          onChange={(e) => setValues((v) => ({ ...v, [m.mode]: e.target.value }))}
                          className="flex-1 bg-surface-container-lowest px-space-md py-space-xs rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
                        />
                        <button
                          disabled={busy === m.mode || !values[m.mode]}
                          onClick={() => submitMode(m)}
                          className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold disabled:opacity-60"
                        >
                          {busy === m.mode ? 'Submitting…' : 'Submit'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allDone ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-space-xl w-full px-space-xl py-space-md rounded-xl bg-tertiary text-on-tertiary font-label-lg text-label-lg font-bold"
          >
            Go to dashboard →
          </button>
        ) : (
          <div className="mt-space-xl flex flex-col gap-space-sm">
            <button
              onClick={devApprove}
              disabled={busy !== null}
              className="w-full px-space-md py-space-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md font-semibold disabled:opacity-60"
            >
              Skip for now (dev only)
            </button>
          </div>
        )}

        <p className="text-on-surface-variant font-body-sm text-body-sm mt-space-md text-center">
          We protect your data with industry-standard encryption. We never sell or share your information.
        </p>
      </div>
    </main>
  );
}
