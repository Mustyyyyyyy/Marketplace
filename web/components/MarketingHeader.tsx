'use client';
import Link from 'next/link';
import { useState } from 'react';

const LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1V29C17769QivY-cBn1fflBw8aq6rLLnnCnd-qd0d_17M6cTqMO0_vo0LYRaLx5tz-MCuD0YqqJclFfv8ZsURf88mHX4parxss3msLfNay5g58MxIv4Wzj4lJLCX_rSAS1ljGqbnPSUcWUamkWck4PLKoLUczBpCTkySOQS22ONiUMdbppUaNli1LelPWF49VqLkFpazDciqGE86u3Vjkuag9sLT5DFWGGvd1JZiHXN4feXnamCM7585A';

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-container-max mx-auto px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <Link href="/" className="flex items-center gap-space-xs focus:outline-none">
            <img alt="TaskSphere Brand Logo" className="h-8 w-auto object-contain" src={LOGO} />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">TaskSphere</span>
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
          <div className="flex items-center pl-space-xs">
            <Link href="/dashboard" aria-label="Dashboard">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-[0_1px_3px_0_rgba(15,23,42,0.05)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmusVsef5antCXkZeturb3JKyrcuGEP83zViUzdMr5tPmY_S3fgzZMvWWLVv_ToHMChHII2OiGh2oalbVVnBo0fOeC97I_UfDi1t8IIo0d_PRenwN_94zYMDPbsXEs7yMf-tw7omSjVPBdWpQjLLPKS2iqGzrUlP-kK0hqiF1ieO9MuWQS5xFxRAIuwav-67uMYsqYQzohSMUUF1HT2-JXttIKuB1DAJpWd7os0XMILdQbWDi7KsA" />
            </Link>
          </div>
          <button aria-label="Toggle Mobile Menu" className="xl:hidden p-space-xs text-on-surface-variant hover:text-on-surface focus:outline-none" type="button" onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="xl:hidden bg-surface-container-lowest border-t border-outline-variant">
          <div className="max-w-container-max mx-auto px-gutter-mobile py-space-md flex flex-col gap-space-md">
            <Link href="/find-tasks" onClick={() => setOpen(false)}>Find Tasks</Link>
            <Link href="/find-taskers" onClick={() => setOpen(false)}>Find Taskers</Link>
            <Link href="/how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
            <Link href="/categories" onClick={() => setOpen(false)}>Categories</Link>
            <Link href="/become-a-tasker" onClick={() => setOpen(false)}>Become a Tasker</Link>
            <Link href="/trust-safety" onClick={() => setOpen(false)}>Trust &amp; Safety</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            <Link className="font-bold text-secondary" href="/get-started" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
