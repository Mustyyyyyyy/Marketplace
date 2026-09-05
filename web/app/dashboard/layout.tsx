'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCachedUser, fetchMe, clearAuth } from '@/lib/auth';

// Fast dashboard gate.
// 1. Synchronously read the cached user from localStorage. If we have one
//    AND its kycStatus === 'APPROVED', render the children immediately.
// 2. In the background, refresh /me. If KYC turns out to be required, we
//    redirect — the user sees a fully-rendered dashboard for the brief
//    window, no spinners on every navigation.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const initial = typeof window !== 'undefined' ? getCachedUser() : null;
  const [state, setState] = useState<'render' | 'auth' | 'kyc'>(() => {
    if (!initial) return 'render'; // render, then revalidate
    if (initial.kycStatus === 'APPROVED') return 'render';
    if (pathname?.startsWith('/dashboard/kyc') || pathname?.startsWith('/verify-identity')) return 'render';
    return 'render';
  });

  useEffect(() => {
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!access) { router.replace('/sign-in'); return; }
    // Always revalidate /me in the background.
    fetchMe(true)
      .then((u) => {
        if (!u) { clearAuth(); router.replace('/sign-in'); return; }
        if (u.kycStatus === 'APPROVED') { setState('render'); return; }
        // Allow access to /verify-identity and the existing /dashboard/kyc page
        if (pathname?.startsWith('/dashboard/kyc') || pathname?.startsWith('/verify-identity')) {
          setState('render');
          return;
        }
        setState('kyc');
        router.replace('/verify-identity');
      })
      .catch(() => { /* keep cached state */ });
  }, [router, pathname]);

  // On every navigation, kick a /me revalidation if we don't have fresh data
  useEffect(() => {
    fetchMe().catch(() => null);
  }, [pathname]);

  return <>{children}</>;
}
