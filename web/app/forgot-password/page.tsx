'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch('/api/backend/api/auth/password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Request failed');
      }
      setDone(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter-mobile py-space-3xl">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-space-xl border border-outline-variant">
        <Link href="/sign-in" className="text-secondary font-label-md text-label-md font-semibold">← Back to sign in</Link>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-md">Forgot your password?</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
          Enter the email address you use to sign in. We&apos;ll send you a secure link to reset your password.
        </p>

        {done ? (
          <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-md">
            <h2 className="font-headline-sm text-headline-sm font-bold">Check your inbox</h2>
            <p className="font-body-md text-body-md mt-1">
              If an account exists for <strong>{email}</strong>, we just sent a password reset link. The link expires in 30 minutes.
            </p>
            <p className="font-body-sm text-body-sm mt-space-sm">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button type="button" onClick={() => setDone(false)} className="underline font-semibold">try again</button>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-space-md">
            {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm text-sm">{err}</div> : null}
            <label className="flex flex-col gap-1">
              <span className="font-label-md text-label-md font-semibold text-on-surface">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                autoComplete="email"
                autoFocus
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-on-surface-variant font-body-sm text-body-sm mt-space-lg">
          Remembered it? <Link className="text-secondary font-semibold" href="/sign-in">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
