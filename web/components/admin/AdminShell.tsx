'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminApi, type AdminContext } from '@/lib/admin';

const NAV: { section: string; items: { href: string; label: string; icon: string; cap?: string }[] }[] = [
  {
    section: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    ],
  },
  {
    section: 'People',
    items: [
      { href: '/admin/users', label: 'Users', icon: 'group', cap: 'users:view' },
      { href: '/admin/kyc', label: 'KYC', icon: 'verified_user', cap: 'kyc:view' },
      { href: '/admin/admins', label: 'Admins & Invites', icon: 'admin_panel_settings', cap: 'admins:view' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/admin/tasks', label: 'Tasks', icon: 'task_alt', cap: 'tasks:view' },
      { href: '/admin/disputes', label: 'Disputes', icon: 'gavel', cap: 'disputes:view' },
      { href: '/admin/reports', label: 'Reports', icon: 'flag', cap: 'reports:view' },
      { href: '/admin/reviews', label: 'Reviews', icon: 'reviews', cap: 'reviews:moderate' },
    ],
  },
  {
    section: 'Engagement',
    items: [
      { href: '/admin/categories', label: 'Categories', icon: 'category', cap: 'categories:view' },
      { href: '/admin/broadcasts', label: 'Broadcasts', icon: 'campaign', cap: 'broadcasts:view' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: 'monitoring', cap: 'analytics:view' },
      { href: '/admin/risk', label: 'Risk & Fraud', icon: 'shield', cap: 'risk:view' },
      { href: '/admin/audit', label: 'Audit Log', icon: 'history', cap: 'audit:view' },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { href: '/admin/settings', label: 'Site Settings', icon: 'settings', cap: 'settings:view' },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ctx, setCtx] = useState<AdminContext | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi.me()
      .then((c) => setCtx(c))
      .catch((e) => {
        if (String(e.message).includes('Unauthorized')) {
          router.replace('/sign-in?next=' + encodeURIComponent(pathname || '/admin'));
        } else {
          setErr(e.message);
        }
      });
  }, [router, pathname]);

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-error-container text-on-error-container rounded-xl p-6 max-w-md">
          <h2 className="font-bold mb-2">Admin access failed</h2>
          <p className="text-sm">{err}</p>
        </div>
      </div>
    );
  }
  if (!ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant">Loading admin…</div>
      </div>
    );
  }

  const caps = new Set(ctx.capabilities);
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface text-on-surface">
      <aside className="w-full md:w-64 md:shrink-0 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant flex flex-col md:min-h-screen">
        <div className="p-4 border-b border-outline-variant">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-secondary">admin_panel_settings</span>
            <span className="font-bold text-lg">TaskSphere Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 max-h-64 md:max-h-none">
          {NAV.map((s) => {
            const visible = s.items.filter((i) => !i.cap || caps.has(i.cap));
            if (visible.length === 0) return null;
            return (
              <div key={s.section} className="mb-3">
                <div className="px-2 py-1 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{s.section}</div>
                {visible.map((i) => {
                  const active = i.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(i.href);
                  return (
                    <Link key={i.href} href={i.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? 'bg-secondary text-on-secondary font-semibold' : 'hover:bg-surface-container text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[20px]">{i.icon}</span>
                      <span>{i.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-outline-variant">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">{(ctx.user.displayName || ctx.user.email)[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{ctx.user.displayName || ctx.user.email}</div>
              <div className="text-xs text-on-surface-variant uppercase">{ctx.user.role}</div>
            </div>
          </div>
          <Link href="/dashboard" className="block text-xs text-secondary hover:underline mb-1">← Back to app</Link>
          <button onClick={() => { localStorage.clear(); router.push('/sign-in'); }} className="block text-xs text-on-surface-variant hover:underline">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
