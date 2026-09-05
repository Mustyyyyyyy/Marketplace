'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FirebaseAuthButton from '@/components/FirebaseAuthButton';
import { setTokens, fetchMe } from '@/lib/auth';

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const justReset = params.get('reset') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const r = await fetch('/api/backend/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Sign in failed'); }
      const j = await r.json();
      if (j?.accessToken) {
        setTokens(j.accessToken, j.refreshToken);
        // Pre-warm /me in parallel with the route change so the dashboard
        // renders instantly with the right data.
        await fetchMe(true);
      }
      router.push(next);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const onFirebaseSuccess = async (j: any) => {
    if (j?.accessToken) {
      setTokens(j.accessToken, j.refreshToken);
      await fetchMe(true);
    }
    router.push(next);
  };

  return (
    <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-md p-space-xl border border-outline-variant">
      <div className="flex items-center gap-space-sm mb-space-lg">
        <span className="material-symbols-outlined text-3xl text-secondary">task_alt</span>
        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">TaskSphere</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Welcome back</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">Sign in to post a task or apply to work</p>

      {justReset ? (
        <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-space-sm text-sm mb-space-md">Password updated — please sign in with your new password.</div>
      ) : null}
      {err ? <div className="bg-error-container text-on-error-container rounded-xl p-space-sm mb-space-md text-sm">{err}</div> : null}

      <FirebaseAuthButton mode="signin" onSuccess={onFirebaseSuccess} onError={(m) => setErr(m)} disabled={loading} />

      <div className="my-space-md flex items-center gap-space-sm">
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">or</span>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-space-md">
        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-semibold text-on-surface">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Password</span>
            <Link href="/forgot-password" className="font-label-sm text-label-sm text-secondary font-semibold hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <input required type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-low px-space-md py-space-sm pr-12 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-secondary" autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md font-semibold">{show ? 'Hide' : 'Show'}</button>
          </div>
        </label>
        <button disabled={loading} className="mt-space-xs px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-inverse-surface transition-all disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <p className="text-center mt-space-lg text-on-surface-variant font-body-md text-body-md">New to TaskSphere? <Link className="text-secondary font-semibold" href="/get-started">Create an account</Link></p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter-mobile py-space-3xl">
      <Suspense fallback={<div className="text-on-surface-variant">Loading…</div>}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
