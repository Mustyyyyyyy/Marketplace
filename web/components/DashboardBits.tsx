'use client';
import Link from 'next/link';

export function StatCard({ label, value, hint, icon, tone = 'neutral', trend, href }: {
  label: string; value: string | number; hint?: string; icon: string; tone?: 'neutral' | 'success' | 'warning' | 'info'; trend?: 'up' | 'down'; href?: string;
}) {
  const toneClass = {
    neutral: 'bg-surface-container-high text-on-surface-variant',
    success: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    info: 'bg-secondary-fixed text-on-secondary-fixed',
    warning: 'bg-amber-100 text-amber-900',
  }[tone];

  const trendClass = trend === 'up' ? 'text-on-tertiary-container' : trend === 'down' ? 'text-error' : 'text-on-surface-variant';

  const inner = (
    <div className="flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-space-xs">
        <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
        <span className={`p-2 rounded-xl ${toneClass}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-headline-md text-headline-md text-on-surface font-bold">{value}</span>
        {hint ? (
          <div className={`flex items-center gap-1 mt-1 font-label-sm text-label-sm ${trendClass}`}>
            {trend ? <span className="material-symbols-outlined text-[14px]">{trend === 'up' ? 'trending_up' : 'trending_down'}</span> : <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />}
            <span>{hint}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Greeting({ name, badge, subtitle, action }: { name: string; badge?: { label: string; icon?: string }; subtitle: string; action?: React.ReactNode }) {
  return (
    <section className="relative w-full rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm mb-space-xl overflow-hidden">
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-24 w-64 h-64 rounded-full bg-on-tertiary-container/10 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
        <div className="flex flex-col gap-space-2xs max-w-2xl">
          <div className="flex flex-wrap items-center gap-space-xs">
            {badge ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-wider">
                {badge.icon ? <span className="material-symbols-outlined text-secondary text-[16px]">{badge.icon}</span> : null}
                {badge.label}
              </span>
            ) : null}
            <span className="text-outline text-body-sm font-body-sm">•</span>
            <span className="text-on-surface-variant font-label-md text-label-md">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">Good {timeOfDay()}, {name}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{subtitle}</p>
        </div>
        {action ? <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-center">{action}</div> : null}
      </div>
    </section>
  );
}

export function TrustCallout() {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-primary-container via-surface-tint to-primary-container text-on-secondary p-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
      <div className="flex items-start gap-space-md">
        <div className="p-space-sm rounded-2xl bg-surface-container-lowest/10 backdrop-blur-md text-tertiary-fixed shrink-0">
          <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-secondary">TaskSphere Escrow Protection Guarantee</h3>
            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase font-bold">100% Protected</span>
          </div>
          <p className="font-body-md text-body-md text-primary-fixed max-w-3xl mt-1">
            Every contract dollar is secured in segregated Escrow before work begins. Milestones auto-release upon client signoff or dispute resolution.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
        <Link href="/trust-safety" className="px-space-md py-2.5 rounded-xl bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-secondary font-label-md text-label-md transition-colors">Read Safety Protocols</Link>
        <Link href="/dashboard/payments" className="px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-on-primary-fixed font-label-md text-label-md transition-colors shadow-sm">Payment Settings</Link>
      </div>
    </section>
  );
}

function timeOfDay() { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; }
