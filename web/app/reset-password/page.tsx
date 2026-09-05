'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="bg-error-container text-on-error-container rounded-xl p-space-md">
        <h2 className="font-headline-sm text-headline-sm font-bold">Invalid or missing link</h2>
        <p className="font-body-md text-body-md mt-1">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="inline-block mt-space-sm font-label-md text-label-md font-semibold underline">Request a new one →</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setErr('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/backend/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Reset failed');
      }
      setDone(true);
      setTimeout(() => router.push('/sign-in?reset=1'), 2000);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {done ? (
        <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-md">
          <h2 className="font-headline-sm text-headline-sm font-bold">Password updated</h2>
          <p className="font-body-md text-body-md mt-1">Redirecting you to sign in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-space-md">
          {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm text-sm">{err}</div> : null}
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">New password</span>
            <div className="relative">
              <input
                required minLength={8}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-space-sm pr-12 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                autoComplete="new-password"
                autoFocus
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md font-semibold">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Confirm new password</span>
            <input
              required minLength={8}
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter-mobile py-space-3xl">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-space-xl border border-outline-variant">
        <Link href="/sign-in" className="text-secondary font-label-md text-label-md font-semibold">← Back to sign in</Link>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-md">Choose a new password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
          Once you set a new password, you&apos;ll be signed in automatically.
        </p>
        <Suspense fallback={<div className="text-on-surface-variant">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
