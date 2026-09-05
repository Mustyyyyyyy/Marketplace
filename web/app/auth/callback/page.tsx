'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const access = sp.get('access') || '';
    const refresh = sp.get('refresh') || '';
    if (!access || !refresh) { setErr('Missing tokens'); return; }
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    // Pre-warm auth state by fetching /me and caching it.
    fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` }, cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (j?.user) {
          // Pre-warm both the new (lib/auth cache) and the legacy (dashboard) keys.
          try { localStorage.setItem('user', JSON.stringify(j.user)); } catch {}
          if (j.user.signupStep === 'COMPLETE' || j.user.kycStatus === 'APPROVED') {
            router.replace('/dashboard');
          } else {
            router.replace('/verify-identity');
          }
        } else {
          router.replace('/dashboard');
        }
      })
      .catch(() => router.replace('/dashboard'));
  }, [sp, router]);

  if (err) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-surface px-gutter-mobile">
        <div className="max-w-md w-full bg-error-container text-on-error-container rounded-xl p-space-md text-sm">
          {err}
        </div>
      </main>
    );
  }
  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface">
      <div className="text-on-surface-variant">Signing you in…</div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main className="w-full min-h-screen flex items-center justify-center bg-surface"><div>Signing you in…</div></main>}>
      <CallbackInner />
    </Suspense>
  );
}
