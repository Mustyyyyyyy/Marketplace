'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1Uh2KoICI3H0JG_F-RkGVGqHTmX5Ntf-m5uOuZHNYazQ5RIKIDsSx0Ty8eYkXP0qoBYZ375y-LsRrcye21VpKE47q7xm5TyZDeBEtRO_aKPifxot6H9hmfROzMp5PH9o0XkZJ5tsFaK7iMwOUtNPPm3qp6uZuLDB_h1PDduiWIHp3H5hgK5dRjdr8lva2fbXGN5JeUNcAUtDuw3eIC8KRvvGx_nPJiMgJwoksoxsyKuwa5Fw3AfivJuCQ';

interface NavItem { href: string; label: string; icon: string; badge?: string | number; }

const TASKER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/find-tasks', label: 'Find Tasks', icon: 'search' },
  { href: '/dashboard/offers', label: 'My Offers', icon: 'local_offer' },
  { href: '/dashboard/jobs', label: 'My Jobs', icon: 'work' },
  { href: '/dashboard/messages', label: 'Messages', icon: 'chat_bubble' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/dashboard/reviews', label: 'Reviews & Reputation', icon: 'star' },
  { href: '/dashboard/profile', label: 'My Profile', icon: 'person' },
  { href: '/dashboard/availability', label: 'Availability', icon: 'event_available' },
];

const CUSTOMER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/tasks', label: 'My Tasks', icon: 'task_alt' },
  { href: '/dashboard/tasks/new', label: 'Post a Task', icon: 'post_add' },
  { href: '/dashboard/taskers', label: 'Find Taskers', icon: 'search' },
  { href: '/dashboard/messages', label: 'Messages', icon: 'chat_bubble' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/dashboard/payments', label: 'Payments', icon: 'payments' },
  { href: '/dashboard/profile', label: 'My Profile', icon: 'person' },
];

const SUPPORT_NAV: NavItem[] = [
  { href: '/help', label: 'Help & Support', icon: 'help' },
  { href: '/trust-safety', label: 'Safety Center', icon: 'shield' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
  { href: '#', label: 'Log Out', icon: 'logout' },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [notifDot, setNotifDot] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (!access) { router.push('/sign-in?next=' + encodeURIComponent(path)); return; }
    Promise.all([
      fetch('/api/backend/api/auth/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch('/api/backend/api/profile/me', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/backend/api/notifications', { headers: { Authorization: `Bearer ${access}` } }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([m, p, n]) => {
        setMe(m.user);
        setProfile(p?.profile);
        setUnreadMsgs(m.user?.unreadMessages ?? 0);
        setNotifDot(Boolean(n?.unread));
      })
      .catch(() => { localStorage.clear(); router.push('/sign-in?next=' + encodeURIComponent(path)); })
      .finally(() => setChecking(false));
  }, [path, router]);

  const signOut = () => { localStorage.clear(); router.push('/'); };
  const isTasker = (me?.role || profile?.role) === 'TASKER';
  const nav = isTasker ? TASKER_NAV : CUSTOMER_NAV;
  // Patch live badge counts where present
  const liveNav = nav.map((n) => {
    if (n.href === '/dashboard/messages' && unreadMsgs) return { ...n, badge: unreadMsgs > 1 ? `${unreadMsgs} unread` : '1 unread' };
    if (n.href === '/dashboard/notifications' && notifDot) return { ...n, badge: 'new' };
    return n;
  });

  if (checking) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading…</div>;

  const isActive = (href: string) => href === '/dashboard' ? path === '/dashboard' : path.startsWith(href);

  return (
    <div className="min-h-screen bg-surface">
      {menuOpen ? <button aria-label="Close navigation" className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMenuOpen(false)} /> : null}
      <aside className={`${menuOpen ? 'flex' : 'hidden'} lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest">
            <Link href="/dashboard" className="flex items-center gap-space-xs">
              <img alt="TaskSphere" className="h-8 w-auto object-contain" src={LOGO} />
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">TaskSphere</span>
            </Link>
            {isTasker ? (
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Pro</span>
            ) : null}
          </div>
          <div className="px-space-sm pt-space-xs">
            <nav className="flex flex-col gap-space-2xs" data-active-classes="bg-primary-container text-on-secondary-container font-label-lg">
              {liveNav.map((n) => {
                const active = isActive(n.href);
                return (
                  <Link key={n.href} href={n.href} className={`flex items-center justify-between px-space-sm py-space-xs rounded-xl transition-all group ${active ? 'bg-primary-container text-on-secondary-container font-label-lg' : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                    <div className="flex items-center gap-space-sm">
                      <span className={`material-symbols-outlined transition-colors text-[20px] ${active ? 'text-on-secondary-container' : 'text-outline group-hover:text-on-surface'}`}>{n.icon}</span>
                      <span>{n.label}</span>
                    </div>
                    {n.badge ? (
                      <span className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm leading-none ${active ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface'}`}>{n.badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="p-space-sm bg-surface-container-lowest">
          <div className="mb-space-2xs px-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Support &amp; System</div>
          <nav className="flex flex-col gap-space-2xs">
            {SUPPORT_NAV.map((n) => (
              <Link key={n.label} href={n.href} onClick={(e) => { if (n.label === 'Log Out') { e.preventDefault(); signOut(); } }} className={`flex items-center gap-space-sm px-space-sm py-space-xs rounded-xl font-label-lg text-label-lg transition-all group ${n.label === 'Log Out' ? 'text-error hover:bg-error-container hover:text-on-error-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <span className={`material-symbols-outlined transition-colors text-[20px] ${n.label === 'Log Out' ? 'text-error' : 'text-outline group-hover:text-on-surface'}`}>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop">
          <div className="flex items-center gap-space-md">
            <button aria-label="Open navigation" className="lg:hidden p-space-xs rounded-xl hover:bg-surface-container-high" onClick={() => setMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:flex items-center">
              <span className="material-symbols-outlined absolute left-space-sm text-outline pointer-events-none text-[18px]">search</span>
              <input className="h-10 pl-9 pr-14 w-64 lg:w-80 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary-container transition-all" placeholder="Search tasks, clients, messages..." type="text" />
              <div className="absolute right-space-xs flex items-center gap-0.5 px-space-2xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant pointer-events-none">
                <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            {isTasker ? <AvailabilityPill /> : null}
            {isTasker ? (
              <Link href="/dashboard/find-tasks" className="hidden lg:flex items-center gap-space-xs h-10 px-space-md rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Browse Tasks</span>
              </Link>
            ) : (
              <Link href="/dashboard/tasks/new" className="hidden lg:flex items-center gap-space-xs h-10 px-space-md rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Post a Task</span>
              </Link>
            )}
            <div className="flex items-center gap-space-xs">
              <Link href="/dashboard/messages" aria-label="Messages" className="relative p-space-xs rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                {unreadMsgs > 0 ? <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" /> : null}
              </Link>
              <Link href="/dashboard/notifications" aria-label="Notifications" className="relative p-space-xs rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {notifDot ? <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" /> : null}
              </Link>
              <Link href="/help" aria-label="Help" className="p-space-xs rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
              </Link>
            </div>
            <Link href="/dashboard/profile" className="flex items-center gap-space-sm pl-space-xs cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-secondary-container flex items-center justify-center font-bold text-label-md">{(me?.displayName || me?.email || '?')[0]?.toUpperCase()}</div>
              <div className="hidden xl:flex flex-col">
                <span className="font-label-md text-label-md text-on-surface leading-none">{me?.displayName || 'You'}</span>
                {isTasker && profile?.taskerProfile?.ratingAvg ? (
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {Number(profile.taskerProfile.ratingAvg).toFixed(1)} ({profile.taskerProfile.ratingCount || 0})
                  </span>
                ) : (
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{me?.email}</span>
                )}
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors text-[18px]">keyboard_arrow_down</span>
            </Link>
          </div>
        </header>
        <main className="relative pt-16 bg-surface min-h-screen px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-xl">
          {children}
        </main>
      </div>
    </div>
  );
}

function AvailabilityPill() {
  const [available, setAvailable] = useState(true);
  return (
    <button
      onClick={() => setAvailable(!available)}
      className="flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-tertiary-container font-label-md text-label-md"
    >
      <span className={`w-2 h-2 rounded-full ${available ? 'bg-on-tertiary-container animate-pulse' : 'bg-outline'}`} />
      <span>{available ? 'Available for Work' : 'Currently Unavailable'}</span>
    </button>
  );
}
