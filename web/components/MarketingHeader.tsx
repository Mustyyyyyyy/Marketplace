'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const LOGO = '/icons/icon.svg';

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(Boolean(localStorage.getItem('access')));
  }, []);
  const homeHref = signedIn ? '/dashboard' : '/';
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex items-center justify-between gap-space-md min-w-0">
        <div className="flex items-center gap-space-lg min-w-0">
          <Link href={homeHref} className="flex items-center gap-space-xs focus:outline-none shrink-0">
            <img alt="TaskSphere Brand Logo" className="h-8 w-auto object-contain" src={LOGO} />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold whitespace-nowrap">TaskSphere</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-space-lg">
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/find-tasks">Find Tasks</Link>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/find-taskers">Find Taskers</Link>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/how-it-works">How It Works</Link>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/categories">Categories</Link>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/become-a-tasker">Become a Tasker</Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="hidden sm:flex items-center gap-space-sm">
            <Link className="px-space-md py-space-xs font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/sign-in">Sign In</Link>
            <Link className="px-space-lg py-space-xs rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-inverse-surface transition-all shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]" href="/get-started">Get Started</Link>
          </div>
          <button aria-label="Toggle Mobile Menu" className="xl:hidden p-space-xs text-on-surface-variant hover:text-on-surface focus:outline-none" type="button" onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="xl:hidden bg-surface-container-lowest border-t border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter-mobile py-space-md flex flex-col gap-space-md max-h-[calc(100vh-5rem)] overflow-y-auto">
            {[
              ['search', 'Find Tasks', '/find-tasks'],
              ['person_search', 'Find Taskers', '/find-taskers'],
              ['info', 'How It Works', '/how-it-works'],
              ['category', 'Categories', '/categories'],
              ['workspace_premium', 'Become a Tasker', '/become-a-tasker'],
              ['shield', 'Trust & Safety', '/trust-safety'],
              ['info', 'About', '/about'],
              ['mail', 'Contact', '/contact'],
            ].map(([icon, label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
            <Link className="flex items-center gap-space-sm font-bold text-secondary" href="/get-started" onClick={() => setOpen(false)}>
              <span className="material-symbols-outlined">rocket_launch</span>
              <span>Get Started</span>
            </Link>
            <Link className="flex items-center gap-space-sm font-semibold text-on-surface" href="/sign-in" onClick={() => setOpen(false)}>
              <span className="material-symbols-outlined">login</span>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
